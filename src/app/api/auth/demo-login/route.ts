import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { serverFetch } from "@/lib/api/server";
import { ApiError, Role } from "@/lib/api/types";
import { setAuthCookies } from "@/lib/auth/cookies";
import { UserProfile } from "@/lib/auth/session";

const demoLoginSchema = z.object({
  role: z.enum(["CUSTOMER", "MECHANIC", "ADMIN"]),
});

const DEMO_EMAIL_MAP: Record<Role, string> = {
  CUSTOMER: "customer@roadresq-demo.com",
  MECHANIC: "mechanic@roadresq-demo.com",
  ADMIN: "admin@roadresq-demo.com",
};

interface BackendLoginResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = demoLoginSchema.safeParse(body);

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

    if (!env.DEMO_PASSWORD) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Demo authentication is currently unavailable. DEMO_PASSWORD is not configured.",
        },
        { status: 503 }
      );
    }

    const { role } = parseResult.data;
    const email = DEMO_EMAIL_MAP[role];

    const data = await serverFetch<BackendLoginResponse>("/auth/login", {
      method: "POST",
      body: {
        email,
        password: env.DEMO_PASSWORD,
      },
    });

    await setAuthCookies({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });

    return NextResponse.json({
      success: true,
      message: "Demo login successful",
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
        message: "An unexpected error occurred during demo login",
      },
      { status: 500 }
    );
  }
}
