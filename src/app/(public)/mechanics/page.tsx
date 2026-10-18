import { Metadata } from "next";
import { getPublicMechanicsServer } from "@/lib/api/public";
import {
  GetPublicMechanicsQueryInput,
  getPublicMechanicsQuerySchema,
} from "@/lib/validations/public";
import { PublicMechanicsResponse } from "@/lib/types/public";
import { MechanicsClient } from "./mechanics-client";

export const metadata: Metadata = {
  title: "Mechanics | RoadResQ",
  description:
    "Explore roadside mechanics, review their skills and ratings from completed jobs, and check live availability.",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MechanicsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  // Normalize searchParams for Zod validation
  const rawParams: Record<string, unknown> = {};

  if (typeof resolvedSearchParams.page === "string") {
    rawParams.page = Number(resolvedSearchParams.page);
  }
  rawParams.limit = 12;

  if (typeof resolvedSearchParams.search === "string" && resolvedSearchParams.search.trim()) {
    rawParams.search = resolvedSearchParams.search.trim();
  }

  if (typeof resolvedSearchParams.skill === "string" && resolvedSearchParams.skill.trim()) {
    rawParams.skill = resolvedSearchParams.skill.trim();
  }

  if (typeof resolvedSearchParams.minRating === "string") {
    rawParams.minRating = Number(resolvedSearchParams.minRating);
  }

  if (typeof resolvedSearchParams.availability === "string") {
    rawParams.availability = resolvedSearchParams.availability;
  }

  if (typeof resolvedSearchParams.minJobs === "string") {
    rawParams.minJobs = Number(resolvedSearchParams.minJobs);
  }

  if (typeof resolvedSearchParams.sortBy === "string") {
    rawParams.sortBy = resolvedSearchParams.sortBy;
  }

  if (typeof resolvedSearchParams.sortOrder === "string") {
    rawParams.sortOrder = resolvedSearchParams.sortOrder;
  }

  // Validate with shared schema, fallback to defaults if invalid
  const parsed = getPublicMechanicsQuerySchema.safeParse(rawParams);
  const validatedQuery: GetPublicMechanicsQueryInput = parsed.success
    ? parsed.data
    : { page: 1, limit: 12, sortBy: "rating", sortOrder: "desc" };

  // Fetch initial data on the server with 30s ISR revalidation
  let initialData: PublicMechanicsResponse | undefined;

  try {
    initialData = await getPublicMechanicsServer(validatedQuery);
  } catch {
    // If server-side fetch fails, do NOT pass empty or fallback data.
    // Pass no initialData so the client query runs, and ErrorState is shown if that also fails.
    initialData = undefined;
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <MechanicsClient initialData={initialData} initialQuery={validatedQuery} />
    </div>
  );
}
