import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  checkRateLimit,
  getClientIp,
  isTrustedOriginRequest,
} from "@/lib/serverSecurity";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 6 * 1024 * 1024;
const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
const MAX_PHOTOS_COUNT = 2;
const MAX_NAME_LENGTH = 120;
const MAX_PHONE_LENGTH = 40;
const MAX_EMAIL_LENGTH = 180;
const MAX_MESSAGE_LENGTH = 2500;

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

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

export async function POST(request: NextRequest) {
  if (!isTrustedOriginRequest(request, { requireBrowserHeaders: true })) {
    return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
  }

  const ip = getClientIp(request);
  const rateLimit = checkRateLimit({
    key: `feedback:${ip}`,
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
    return NextResponse.json(
      { error: "Payload is too large" },
      { status: 413 }
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const restaurantId = valueFromFormData(formData, "restaurantId");
  const restaurantName = valueFromFormData(formData, "restaurantName");
  const name = valueFromFormData(formData, "name");
  const phone = valueFromFormData(formData, "phone");
  const email = valueFromFormData(formData, "email");
  const message = valueFromFormData(formData, "message");
  const consent = valueFromFormData(formData, "consent") === "true";
  const lang = valueFromFormData(formData, "lang");
  const photosRaw = formData.getAll("photos");
  const fallbackSinglePhoto = formData.get("photo");

  if (!restaurantId || !name || !phone || !message || !consent) {
    return NextResponse.json(
      {
        error:
          "restaurantId, name, phone, message and consent are required",
      },
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

  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: "Message is too long" },
      { status: 400 }
    );
  }

  const photos = photosRaw.filter((item): item is File => item instanceof File);
  const normalizedPhotos =
    photos.length > 0
      ? photos
      : fallbackSinglePhoto instanceof File
        ? [fallbackSinglePhoto]
        : [];

  if (normalizedPhotos.length > MAX_PHOTOS_COUNT) {
    return NextResponse.json(
      { error: `You can attach up to ${MAX_PHOTOS_COUNT} files` },
      { status: 400 }
    );
  }

  for (const photo of normalizedPhotos) {
    if (photo.size > MAX_PHOTO_BYTES) {
      return NextResponse.json(
        { error: "Each image must be smaller than 4MB" },
        { status: 413 }
      );
    }

    if (photo.type && !ALLOWED_IMAGE_MIME_TYPES.has(photo.type)) {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 415 }
      );
    }
  }

  const photosMeta = normalizedPhotos.map((photo) => ({
    name: photo.name,
    type: photo.type,
    size: photo.size,
  }));

  const payload = {
    restaurantId,
    lang,
    restaurantName,
    hasEmail: Boolean(email),
    messageLength: message.length,
    consent,
    photosCount: photosMeta.length,
    photos: photosMeta,
    receivedAt: new Date().toISOString(),
  };

  // Temporary sink until email/CRM integration is connected.
  console.info("Feedback request received:", payload);

  return NextResponse.json({
    ok: true,
    requestId: randomUUID(),
    remaining: rateLimit.remaining,
  });
}
