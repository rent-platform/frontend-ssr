"use client";

const TRACE_CHAT_ID = "8b9e0d4d-6db7-4c8c-8a65-0ef73f20df24";
const TRACE_DEAL_ID = "dda9fb50-71e5-44e2-9e1e-2eff9ca025e2";
const TRACE_OWNER_ID = "10000000-0000-0000-0000-000000000001";
const TRACE_RENTER_ID = "10000000-0000-0000-0000-000000000002";

const traceEvents = [
  {
    status: "PAYMENT_PENDING",
    currentUserId: TRACE_RENTER_ID,
    side: "renter",
  },
  {
    status: "PAID",
    currentUserId: TRACE_OWNER_ID,
    side: "owner",
  },
  {
    status: "PAID",
    currentUserId: TRACE_OWNER_ID,
    side: "owner",
  },
  {
    status: "ACTIVE",
    currentUserId: TRACE_RENTER_ID,
    side: "renter",
  },
  {
    status: "COMPLETED",
    currentUserId: TRACE_RENTER_ID,
    side: "renter",
  },
] as const;

export function ChatRealtimeTraceButton() {
  return (
    <button
      type="button"
      onClick={() => {
        traceEvents.forEach((event) => {
          console.log(
            "[TRACE][CHAT][REALTIME] deal status message received in chat",
            {
              chatId: TRACE_CHAT_ID,
              dealId: TRACE_DEAL_ID,
              status: event.status,
              currentUserId: event.currentUserId,
              side: event.side,
            },
          );
        });
      }}
    >
      Trace chat realtime status
    </button>
  );
}
