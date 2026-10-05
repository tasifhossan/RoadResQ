export interface Review {
  id: string;
  serviceRequestId: string;
  customerId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
    email: string;
  };
  serviceRequest?: {
    id: string;
    description: string;
    status: string;
  };
}

export interface GetMechanicReviewsQueryInput extends Record<string, unknown> {
  page?: number;
  limit?: number;
}
