export interface SparePart {
  id: string;
  name: string;
  isGlobal: boolean;
  createdByMechanicId?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface GetSparePartsQueryInput extends Record<string, unknown> {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateSparePartInput {
  name: string;
}

export interface UpdateSparePartInput {
  name: string;
}
