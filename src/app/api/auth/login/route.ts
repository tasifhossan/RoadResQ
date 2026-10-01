import { NextResponse } from "next/server";
import { z } from "zod";
import { serverFetch } from "@/lib/api/server";
import { ApiError } from "@/lib/api/types";
import { setAuthCookies } from "@/lib/auth/cookies";
import { UserProfile } from "@/lib/auth/session";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

interface BackendLoginResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = loginSchema.safeParse(body);

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

    const { email, password } = parseResult.data;

    const data = await serverFetch<BackendLoginResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
    });

    await setAuthCookies({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });

    return NextResponse.json({
      success: true,
      message: "Login successful",
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
        message: "An unexpected error occurred during login",
      },
      { status: 500 }
    );
  }
}
