const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type TurnstileVerifyPayload = {
  success?: boolean;
  "error-codes"?: string[];
};

export async function verifyTurnstileToken(params: {
  token: string;
  remoteIp?: string;
}): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    return {
      ok: false,
      error: "Turnstile is not configured on the server",
      status: 500,
    };
  }

  if (!params.token) {
    return {
      ok: false,
      error: "Robot check is required",
      status: 400,
    };
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", params.token);

  if (params.remoteIp) {
    body.set("remoteip", params.remoteIp);
  }

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    return {
      ok: false,
      error: "Robot check could not be verified",
      status: 502,
    };
  }

  const payload = (await response.json()) as TurnstileVerifyPayload;

  if (!payload.success) {
    const errorCodes = payload["error-codes"]?.filter(Boolean) || [];
    return {
      ok: false,
      error:
        errorCodes.length > 0
          ? `Robot check failed: ${errorCodes.join(", ")}`
          : "Robot check failed",
      status: 400,
    };
  }

  return { ok: true };
}
