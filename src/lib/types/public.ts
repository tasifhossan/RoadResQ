import { Availability } from "@/lib/api/types";

export interface PublicMechanicListItem {
  id: string; // user id
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  city: string | null;
  skills: string[];
  rating: number;
  totalJobs: number;
  yearsExperience: number | null;
  availability: Availability;
}

export interface PublicMechanicsFacetItem {
  value: string;
  count: number;
}

export interface PublicMechanicsFacets {
  skills: PublicMechanicsFacetItem[];
  cities: PublicMechanicsFacetItem[];
}

export interface PublicMechanicsResponse {
  items: PublicMechanicListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  facets: PublicMechanicsFacets;
}

export interface PublicMechanicRatingSummary {
  average: number;
  count: number;
  distribution: Record<number, number>;
}

export interface PublicMechanicReview {
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewerName: string;
}

export interface PublicMechanicDetail {
  id: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  city: string | null;
  skills: string[];
  rating: number;
  totalJobs: number;
  yearsExperience: number | null;
  availability: Availability;
  memberSince: string;
  ratingSummary: PublicMechanicRatingSummary;
  reviews: PublicMechanicReview[];
  related: PublicMechanicListItem[];
}

export interface PublicStats {
  completedJobs: number;
  totalRequests: number;
  mechanics: {
    total: number;
    availableNow: number;
  };
  customers: number;
  reviews: {
    count: number;
    averageRating: number;
  };
}

export interface PublicReviewItem {
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewerName: string;
  mechanic: {
    id: string;
    name: string;
  };
}

export interface PublicReviewsResponse {
  reviews: PublicReviewItem[];
  items?: PublicReviewItem[];
}
