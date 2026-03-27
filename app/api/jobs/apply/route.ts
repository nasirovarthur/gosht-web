import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  checkRateLimit,
  getClientIp,
  isTrustedOriginRequest,
} from "@/lib/serverSecurity";
import { verifyTurnstileToken } from "@/lib/turnstile";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 8 * 1024 * 1024;
const MAX_FILE_BYTES = 6 * 1024 * 1024;
const MAX_FILES_COUNT = 2;
const MAX_NAME_LENGTH = 120;
const MAX_PHONE_LENGTH = 40;
const MAX_EMAIL_LENGTH = 180;
const MAX_ABOUT_LENGTH = 3000;
const MONDAY_API_URL = "https://api.monday.com/v2";
const MONDAY_FILE_API_URL = "https://api.monday.com/v2/file";
const MONDAY_API_VERSION = process.env.MONDAY_API_VERSION || "2023-10";

const ALLOWED_FILE_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

type MondayGraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message?: string }>;
};

type MondayCreateItemResult = {
  create_item?: { id?: string };
};

type MondayCreateUpdateResult = {
  create_update?: { id?: string };
};

type MondayAddFileResult = {
  add_file_to_column?: { id?: string };
};

type MondayBoardColumnsResult = {
  boards?: Array<{
    columns?: Array<{
      id: string;
      title: string;
      type: string;
    }>;
  }>;
};

type MondayColumn = {
  id: string;
  title: string;
  type: string;
};

function valueFromFormData(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string): boolean {
  return /^[\d+\-() ]{7,40}$/.test(value);
}

function normalizeTitle(value: string): string {
  return value.trim().toLowerCase();
}

function findColumnByEnvId(
  columns: MondayColumn[],
  envValue: string | undefined
): MondayColumn | null {
  if (!envValue) return null;
  return columns.find((column) => column.id === envValue) || null;
}

function findColumnByAliases(
  columns: MondayColumn[],
  aliases: string[],
  preferredTypes: string[] = []
): MondayColumn | null {
  if (aliases.length === 0) return null;

  const normalizedAliases = aliases.map(normalizeTitle);
  const matchesByTitle = columns.filter((column) =>
    normalizedAliases.some((alias) => normalizeTitle(column.title).includes(alias))
  );

  if (matchesByTitle.length === 0) return null;
  if (preferredTypes.length === 0) return matchesByTitle[0];

  return (
    matchesByTitle.find((column) => preferredTypes.includes(column.type)) ||
    matchesByTitle[0]
  );
}

function parseColumnIdList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function setMondayColumnValue(
  columnValues: Record<string, unknown>,
  column: MondayColumn | null,
  value: string | boolean
) {
  if (!column) return;
  if (typeof value === "string" && !value.trim()) return;

  if (column.type === "phone" && typeof value === "string") {
    columnValues[column.id] = {
      phone: value,
      countryShortName: "uz",
    };
    return;
  }

  if (column.type === "email" && typeof value === "string") {
    columnValues[column.id] = {
      email: value,
      text: value,
    };
    return;
  }

  if (column.type === "long_text" && typeof value === "string") {
    columnValues[column.id] = {
      text: value,
    };
    return;
  }

  if (column.type === "checkbox" && typeof value === "boolean") {
    columnValues[column.id] = {
      checked: value ? "true" : "false",
    };
    return;
  }

  if (column.type === "status") {
    columnValues[column.id] = {
      label: typeof value === "boolean" ? (value ? "Да" : "Нет") : value,
    };
    return;
  }

  if (column.type === "dropdown") {
    columnValues[column.id] = {
      labels: [String(value)],
    };
    return;
  }

  if (column.type === "date") {
    const dateValue =
      typeof value === "boolean"
        ? null
        : value.length >= 10
          ? value.slice(0, 10)
          : value;
    if (!dateValue) return;
    columnValues[column.id] = { date: dateValue };
    return;
  }

  columnValues[column.id] = String(value);
}

function buildMondayUpdateBody(params: {
  requestId: string;
  vacancyId: string;
  vacancyTitle: string;
  vacancyRole: string;
  name: string;
  phone: string;
  email: string;
  about: string;
  consent: boolean;
  lang: string;
  files: Array<{ name: string; type: string; size: number }>;
}) {
  const filesLine =
    params.files.length > 0
      ? params.files
          .map(
            (file) =>
              `- ${file.name} (${file.type || "unknown"}, ${file.size} bytes)`
          )
          .join("\n")
      : "- no file";

  return [
    `Jobs apply request: ${params.requestId}`,
    "",
    `Company: ${params.vacancyTitle || "-"}`,
    `Position: ${params.vacancyRole || "-"}`,
    `Vacancy ID: ${params.vacancyId}`,
    `Candidate: ${params.name}`,
    `Phone: ${params.phone}`,
    `Email: ${params.email || "-"}`,
    `Language: ${params.lang || "-"}`,
    `Consent: ${params.consent ? "yes" : "no"}`,
    "",
    "About:",
    params.about,
    "",
    "Files:",
    filesLine,
  ].join("\n");
}

async function mondayRequest<T>(
  token: string,
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const response = await fetch(MONDAY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
      "API-Version": MONDAY_API_VERSION,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Monday API request failed: ${body}`);
  }

  const payload = (await response.json()) as MondayGraphqlResponse<T>;

  if (payload.errors?.length) {
    const firstMessage = payload.errors[0]?.message || "Unknown Monday GraphQL error";
    throw new Error(`Monday API error: ${firstMessage}`);
  }

  if (!payload.data) {
    throw new Error("Monday API returned empty data");
  }

  return payload.data;
}

async function mondayUploadFile(
  token: string,
  itemId: string,
  columnId: string,
  file: File
) {
  const form = new FormData();
  form.append(
    "query",
    `mutation AddFileToColumn($itemId: ID!, $columnId: String!, $file: File!) {
      add_file_to_column(item_id: $itemId, column_id: $columnId, file: $file) { id }
    }`
  );
  form.append("variables", JSON.stringify({ itemId, columnId }));
  form.append("map", JSON.stringify({ file: "variables.file" }));
  form.append("file", file, file.name);

  const response = await fetch(MONDAY_FILE_API_URL, {
    method: "POST",
    headers: {
      Authorization: token,
      "API-Version": MONDAY_API_VERSION,
    },
    body: form,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Monday file upload failed: ${body}`);
  }

  const payload = (await response.json()) as MondayGraphqlResponse<MondayAddFileResult>;

  if (payload.errors?.length) {
    const firstMessage = payload.errors[0]?.message || "Unknown Monday file upload error";
    throw new Error(`Monday file upload error: ${firstMessage}`);
  }

  if (!payload.data?.add_file_to_column?.id) {
    throw new Error("Monday file upload returned empty id");
  }
}

export async function POST(request: NextRequest) {
  if (!isTrustedOriginRequest(request, { requireBrowserHeaders: true })) {
    return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
  }

  const ip = getClientIp(request);
  const rateLimit = checkRateLimit({
    key: `jobs-apply:${ip}`,
    limit: 8,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      }
    );
  }

  const contentLengthHeader = request.headers.get("content-length");
  const contentLength = contentLengthHeader ? Number(contentLengthHeader) : 0;
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload is too large" }, { status: 413 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const vacancyId = valueFromFormData(formData, "vacancyId");
  const vacancyTitle = valueFromFormData(formData, "vacancyTitle");
  const vacancyRole = valueFromFormData(formData, "vacancyRole");
  const name = valueFromFormData(formData, "name");
  const phone = valueFromFormData(formData, "phone");
  const email = valueFromFormData(formData, "email");
  const about = valueFromFormData(formData, "about");
  const consent = valueFromFormData(formData, "consent") === "true";
  const lang = valueFromFormData(formData, "lang");
  const turnstileToken = valueFromFormData(formData, "turnstileToken");
  const resumesRaw = formData.getAll("resume");
  const fallbackSingleResume = formData.get("resume");

  if (!vacancyId || !name || !phone || !about || !consent) {
    return NextResponse.json(
      { error: "vacancyId, name, phone, about and consent are required" },
      { status: 400 }
    );
  }

  if (name.length > MAX_NAME_LENGTH) {
    return NextResponse.json({ error: "Name is too long" }, { status: 400 });
  }

  if (!isValidPhone(phone) || phone.length > MAX_PHONE_LENGTH) {
    return NextResponse.json({ error: "Phone is invalid" }, { status: 400 });
  }

  if (email && (email.length > MAX_EMAIL_LENGTH || !isValidEmail(email))) {
    return NextResponse.json({ error: "Email is invalid" }, { status: 400 });
  }

  if (about.length > MAX_ABOUT_LENGTH) {
    return NextResponse.json({ error: "About text is too long" }, { status: 400 });
  }

  const resumes = resumesRaw.filter((item): item is File => item instanceof File);
  const normalizedResumes =
    resumes.length > 0
      ? resumes
      : fallbackSingleResume instanceof File
        ? [fallbackSingleResume]
        : [];

  if (normalizedResumes.length > MAX_FILES_COUNT) {
    return NextResponse.json(
      { error: `You can attach up to ${MAX_FILES_COUNT} files` },
      { status: 400 }
    );
  }

  for (const file of normalizedResumes) {
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "File must be smaller than 6MB" }, { status: 413 });
    }

    if (file.type && !ALLOWED_FILE_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });
    }
  }

  const turnstileCheck = await verifyTurnstileToken({
    token: turnstileToken,
    remoteIp: ip,
  });

  if (!turnstileCheck.ok) {
    return NextResponse.json(
      { error: turnstileCheck.error },
      { status: turnstileCheck.status }
    );
  }

  const filesMeta = normalizedResumes.map((file) => ({
    name: file.name,
    type: file.type,
    size: file.size,
  }));

  const mondayToken = process.env.MONDAY_API_TOKEN;
  const mondayBoardId = process.env.MONDAY_JOBS_APPLY_BOARD_ID;
  const mondayGroupId = process.env.MONDAY_JOBS_APPLY_GROUP_ID;

  if (!mondayToken || !mondayBoardId) {
    return NextResponse.json(
      {
        error:
          "Monday CRM is not configured (MONDAY_API_TOKEN / MONDAY_JOBS_APPLY_BOARD_ID)",
      },
      { status: 500 }
    );
  }

  const requestId = randomUUID();
  const itemName = `${vacancyTitle || "Vacancy"} — ${name}`.slice(0, 240);
  const submittedDate = new Date().toISOString().slice(0, 10);

  const updateBody = buildMondayUpdateBody({
    requestId,
    vacancyId,
    vacancyTitle,
    vacancyRole,
    name,
    phone,
    email,
    about,
    consent,
    lang,
    files: filesMeta,
  });

  try {
    const boardMeta = await mondayRequest<MondayBoardColumnsResult>(
      mondayToken,
      `query GetJobsApplyBoardColumns($boardIds: [ID!]) {
        boards(ids: $boardIds) {
          columns {
            id
            title
            type
          }
        }
      }`,
      {
        boardIds: [mondayBoardId],
      }
    );

    const columns = boardMeta.boards?.[0]?.columns || [];

    const companyColumn =
      findColumnByEnvId(columns, process.env.MONDAY_JOBS_COL_COMPANY) ||
      findColumnByAliases(columns, ["компания", "company", "ресторан", "филиал"], [
        "text",
        "long_text",
        "status",
        "dropdown",
      ]);
    const positionColumn =
      findColumnByEnvId(columns, process.env.MONDAY_JOBS_COL_POSITION) ||
      findColumnByAliases(columns, ["должность", "позиция", "position", "role"], [
        "text",
        "status",
        "dropdown",
      ]);
    const candidateColumn =
      findColumnByEnvId(columns, process.env.MONDAY_JOBS_COL_CANDIDATE_NAME) ||
      findColumnByAliases(columns, ["имя", "кандидат", "candidate"], [
        "text",
        "long_text",
      ]);
    const phoneColumn =
      findColumnByEnvId(columns, process.env.MONDAY_JOBS_COL_PHONE) ||
      findColumnByAliases(columns, ["телефон", "phone", "номер"], [
        "phone",
        "text",
      ]);
    const emailColumn =
      findColumnByEnvId(columns, process.env.MONDAY_JOBS_COL_EMAIL) ||
      findColumnByAliases(columns, ["почта", "email", "e-mail"], [
        "email",
        "text",
      ]);
    const aboutColumn =
      findColumnByEnvId(columns, process.env.MONDAY_JOBS_COL_ABOUT) ||
      findColumnByAliases(columns, ["о себе", "about", "текст", "описание"], [
        "long_text",
        "text",
      ]);
    const consentColumn =
      findColumnByEnvId(columns, process.env.MONDAY_JOBS_COL_CONSENT) ||
      findColumnByAliases(columns, ["согласие", "consent"], [
        "checkbox",
        "status",
        "text",
      ]);
    const languageColumn =
      findColumnByEnvId(columns, process.env.MONDAY_JOBS_COL_LANG) ||
      findColumnByAliases(columns, ["язык", "language", "lang"], [
        "status",
        "dropdown",
        "text",
      ]);
    const submittedAtColumn =
      findColumnByEnvId(columns, process.env.MONDAY_JOBS_COL_SUBMITTED_AT) ||
      findColumnByAliases(columns, ["дата", "created", "submitted", "заявки"], [
        "date",
        "text",
      ]);
    const vacancyIdColumn =
      findColumnByEnvId(columns, process.env.MONDAY_JOBS_COL_VACANCY_ID) ||
      findColumnByAliases(columns, ["vacancy id", "id ваканс", "ид ваканс"], [
        "text",
      ]);
    const fileColumnsFromEnv = parseColumnIdList(process.env.MONDAY_JOBS_COL_FILES)
      .map((columnId) => columns.find((column) => column.id === columnId) || null)
      .filter((column): column is MondayColumn => Boolean(column));
    const fileColumns =
      fileColumnsFromEnv.length > 0
        ? fileColumnsFromEnv
        : columns.filter((column) => column.type === "file");

    const columnValues: Record<string, unknown> = {};
    setMondayColumnValue(columnValues, companyColumn, vacancyTitle);
    setMondayColumnValue(columnValues, positionColumn, vacancyRole);
    setMondayColumnValue(columnValues, candidateColumn, name);
    setMondayColumnValue(columnValues, phoneColumn, phone);
    setMondayColumnValue(columnValues, emailColumn, email);
    setMondayColumnValue(columnValues, aboutColumn, about);
    setMondayColumnValue(columnValues, consentColumn, consent);
    setMondayColumnValue(columnValues, languageColumn, lang.toUpperCase());
    setMondayColumnValue(columnValues, submittedAtColumn, submittedDate);
    setMondayColumnValue(columnValues, vacancyIdColumn, vacancyId);

    const columnValuesJson =
      Object.keys(columnValues).length > 0 ? JSON.stringify(columnValues) : null;

    let createdItem: MondayCreateItemResult;

    if (columnValuesJson) {
      try {
        createdItem = await mondayRequest<MondayCreateItemResult>(
          mondayToken,
          `mutation CreateJobsApplyItem(
            $boardId: ID!,
            $itemName: String!,
            $groupId: String,
            $columnValues: JSON!,
            $createLabelsIfMissing: Boolean!
          ) {
            create_item(
              board_id: $boardId,
              item_name: $itemName,
              group_id: $groupId,
              column_values: $columnValues,
              create_labels_if_missing: $createLabelsIfMissing
            ) {
              id
            }
          }`,
          {
            boardId: mondayBoardId,
            itemName,
            groupId: mondayGroupId || null,
            columnValues: columnValuesJson,
            createLabelsIfMissing: true,
          }
        );
      } catch {
        createdItem = await mondayRequest<MondayCreateItemResult>(
          mondayToken,
          `mutation CreateJobsApplyItem(
            $boardId: ID!,
            $itemName: String!,
            $groupId: String
          ) {
            create_item(
              board_id: $boardId,
              item_name: $itemName,
              group_id: $groupId
            ) {
              id
            }
          }`,
          {
            boardId: mondayBoardId,
            itemName,
            groupId: mondayGroupId || null,
          }
        );
      }
    } else {
      createdItem = await mondayRequest<MondayCreateItemResult>(
        mondayToken,
        `mutation CreateJobsApplyItem(
          $boardId: ID!,
          $itemName: String!,
          $groupId: String
        ) {
          create_item(
            board_id: $boardId,
            item_name: $itemName,
            group_id: $groupId
          ) {
            id
          }
        }`,
        {
          boardId: mondayBoardId,
          itemName,
          groupId: mondayGroupId || null,
        }
      );
    }

    const mondayItemId = createdItem.create_item?.id;
    if (!mondayItemId) {
      throw new Error("Monday create_item returned empty id");
    }

    await mondayRequest<MondayCreateUpdateResult>(
      mondayToken,
      `mutation AddJobsApplyUpdate($itemId: ID!, $body: String!) {
        create_update(item_id: $itemId, body: $body) {
          id
        }
      }`,
      {
        itemId: mondayItemId,
        body: updateBody,
      }
    );

    if (normalizedResumes.length > 0 && fileColumns.length > 0) {
      const filesToUpload = normalizedResumes.slice(0, fileColumns.length);

      for (let index = 0; index < filesToUpload.length; index += 1) {
        const file = filesToUpload[index];
        const fileColumn = fileColumns[index];
        if (!fileColumn) continue;

        await mondayUploadFile(mondayToken, mondayItemId, fileColumn.id, file);
      }
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Monday integration error";
    return NextResponse.json(
      { error: `Could not send jobs apply to Monday CRM: ${message}` },
      { status: 502 }
    );
  }

  console.info("Job apply request sent to Monday CRM:", {
    requestId,
    vacancyId,
    vacancyTitle,
    vacancyRole,
    lang,
    hasEmail: Boolean(email),
    aboutLength: about.length,
    resumesCount: filesMeta.length,
    files: filesMeta,
    consent,
    receivedAt: new Date().toISOString(),
  });

  return NextResponse.json({
    ok: true,
    requestId,
    remaining: rateLimit.remaining,
  });
}
