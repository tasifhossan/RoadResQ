import { NextResponse } from "next/server";
import { serverFetch } from "@/lib/api/server";
import { ApiError } from "@/lib/api/types";
import { setAuthCookies } from "@/lib/auth/cookies";
import { UserProfile } from "@/lib/auth/session";
import { googleAuthSchema } from "@/lib/validations/auth";

interface BackendGoogleAuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

export async function POST(request: Request) {
  // 1. Same-origin CSRF check
  const origin = request.headers.get("origin");
  const rawForwardedHost = request.headers.get("x-forwarded-host");
  const firstForwardedHost = rawForwardedHost
    ? rawForwardedHost.split(",")[0].trim()
    : null;
  const targetHost = firstForwardedHost || request.headers.get("host");

  if (!origin || !targetHost) {
    return NextResponse.json(
      { success: false, message: "Cross-origin requests forbidden" },
      { status: 403 }
    );
  }

  try {
    const originHost = new URL(origin).host;
    if (originHost.toLowerCase() !== targetHost.toLowerCase()) {
      return NextResponse.json(
        { success: false, message: "Cross-origin requests forbidden" },
        { status: 403 }
      );
    }
  } catch {
    return NextResponse.json(
      { success: false, message: "Cross-origin requests forbidden" },
      { status: 403 }
    );
  }

  // 2. Parse and validate strictly with Zod
  try {
    const body = await request.json();
    const parseResult = googleAuthSchema.safeParse(body);

    if (!parseResult.success) {
      const formattedErrors = parseResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: formattedErrors,
        },
        { status: 400 }
      );
    }

    const { idToken } = parseResult.data;

    // 3. Call backend POST /auth/google via serverFetch (Never log the token)
    const data = await serverFetch<BackendGoogleAuthResponse>("/auth/google", {
      method: "POST",
      body: { idToken },
    });

    // 4. Set auth cookies
    await setAuthCookies({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });

    // 5. Return only { user } in the same envelope as /api/auth/login
    return NextResponse.json({
      success: true,
      message: "Google sign-in successful",
      data: {
        user: data.user,
      },
    });
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          ...(error.errors ? { errors: error.errors } : {}),
        },
        { status: error.status }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred during Google sign-in",
      },
      { status: 500 }
    );
  }
}
