import { cookies } from "next/headers";
import { COOKIE_ACCESS_TOKEN } from "@/lib/auth/constants";
import { requireRole } from "@/lib/auth/session";
import { UserProfile } from "@/lib/auth/session";
import { Paginated } from "@/lib/api/types";
import { GetMechanicReviewsQueryInput, Review } from "@/lib/types/reviews";
import { getMechanicReviewsQuerySchema } from "@/lib/validations/reviews";
import { getMeServer } from "@/lib/api/endpoints/users.server";
import { getMechanicReviewsServer } from "@/lib/api/endpoints/reviews.server";
import { getErrorMessage } from "@/lib/errors";
import { MechanicProfileClient } from "./mechanic-profile-client";

interface MechanicProfilePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MechanicProfilePage({
  searchParams,
}: MechanicProfilePageProps) {
  // 1. Enforce authentication & MECHANIC role scoping
  await requireRole("MECHANIC");

  // 2. Read searchParams for reviews pagination
  const resolvedParams = await searchParams;
  const rawQuery = {
    page: resolvedParams.page ? Number(resolvedParams.page) : undefined,
    limit: resolvedParams.limit ? Number(resolvedParams.limit) : undefined,
  };

  const parsedQuery = getMechanicReviewsQuerySchema.safeParse(rawQuery);
  const reviewsQueryParams: GetMechanicReviewsQueryInput = parsedQuery.success
    ? parsedQuery.data
    : { page: 1, limit: 10 };

  // 3. Retrieve session access token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;

  let initialUser: UserProfile | null = null;
  let initialReviews: Paginated<Review> | null = null;
  let initialError: string | null = null;

  // 4. Server fetch initial data
  if (token) {
    try {
      const meRes = await getMeServer(token);
      initialUser = meRes.user;

      if (initialUser && initialUser.id) {
        initialReviews = await getMechanicReviewsServer(
          token,
          initialUser.id,
          reviewsQueryParams
        );
      }
    } catch (err) {
      initialError = getErrorMessage(err);
    }
  }

  // 5. Pass initialData to client component
  return (
    <MechanicProfileClient
      initialUser={initialUser}
      initialReviews={initialReviews}
      initialError={initialError}
      reviewsQueryParams={reviewsQueryParams}
    />
  );
}
