import { baseApi } from "@/business/shared";
import type {
  ComplaintResponseDto,
  ComplaintsListResponseDto,
  CreateComplaintRequestDto,
  FetchComplaintsArgs,
  HandleComplaintRequestDto,
} from "../types";

const COMPLAINTS_URL = "api/complaints";
const COMPLAINTS_LIST_TAG_ID = "LIST";

function buildComplaintParams(
  args: FetchComplaintsArgs = {},
): Record<string, string> {
  return Object.fromEntries(
    Object.entries({
      page: args.page ?? 0,
      size: args.size ?? 20,
      status: args.status,
      targetType: args.targetType,
    }).flatMap(([key, value]) =>
      value === undefined || value === "" ? [] : [[key, String(value)]],
    ),
  );
}

const getComplaintTags = (items?: ComplaintResponseDto[]) =>
  items?.map((item) => ({ type: "Complaints" as const, id: item.id })) ?? [];

export const complaintsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    fetchComplaints: build.query<
      ComplaintsListResponseDto,
      FetchComplaintsArgs | void
    >({
      query: (args) => ({
        url: COMPLAINTS_URL,
        params: buildComplaintParams(args ?? {}),
      }),
      providesTags: (result) => [
        { type: "Complaints", id: COMPLAINTS_LIST_TAG_ID },
        ...getComplaintTags(result?.content),
      ],
    }),

    createComplaint: build.mutation<
      ComplaintResponseDto,
      CreateComplaintRequestDto
    >({
      query: (body) => ({
        url: COMPLAINTS_URL,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Complaints", id: COMPLAINTS_LIST_TAG_ID }],
    }),

    handleComplaint: build.mutation<
      ComplaintResponseDto,
      { complaintId: string; body: HandleComplaintRequestDto }
    >({
      query: ({ complaintId, body }) => ({
        url: `${COMPLAINTS_URL}/${complaintId}/handle`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { complaintId }) => [
        { type: "Complaints", id: COMPLAINTS_LIST_TAG_ID },
        { type: "Complaints", id: complaintId },
      ],
    }),
  }),
});

export const {
  useFetchComplaintsQuery,
  useCreateComplaintMutation,
  useHandleComplaintMutation,
} = complaintsApi;
