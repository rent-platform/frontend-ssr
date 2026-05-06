export type ComplaintTargetType = "USER" | "ITEM" | string;
export type ComplaintStatus = "OPEN" | "RESOLVED" | "DISMISSED" | string;

export type ComplaintResponseDto = {
  id: string;
  authorId: string;
  targetType: ComplaintTargetType;
  targetId: string;
  reason: string;
  status: ComplaintStatus;
  handledBy: string | null;
  resolution: string | null;
  createdAt: string;
};

export type CreateComplaintRequestDto = {
  targetType: ComplaintTargetType;
  targetId: string;
  reason: string;
};

export type HandleComplaintRequestDto = {
  status: "RESOLVED" | "DISMISSED" | string;
  resolution?: string | null;
};

export type ComplaintsListResponseDto = {
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  size: number;
  content: ComplaintResponseDto[];
  number: number;
  numberOfElements?: number;
  empty?: boolean;
};

export type FetchComplaintsArgs = {
  page?: number;
  size?: number;
  status?: ComplaintStatus;
  targetType?: ComplaintTargetType;
};
