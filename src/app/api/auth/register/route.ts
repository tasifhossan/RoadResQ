import { NextResponse } from "next/server";
import { z } from "zod";
import { serverFetch } from "@/lib/api/server";
import { ApiError } from "@/lib/api/types";
import { UserProfile } from "@/lib/auth/session";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().nullable().optional(),
  role: z.enum(["CUSTOMER", "MECHANIC", "ADMIN"]),
});

interface BackendRegisterResponse {
  user: UserProfile;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = registerSchema.safeParse(body);

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

    const data = await serverFetch<BackendRegisterResponse>("/auth/register", {
      method: "POST",
      body: parseResult.data,
    });

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
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
        message: "An unexpected error occurred during registration",
      },
      { status: 500 }
    );
  }
}
