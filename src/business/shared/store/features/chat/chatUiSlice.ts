import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ChatListTab = "all" | "renting_out" | "renting_in" | "inquiries";

export interface ChatUiState {
  activeChatId: string | null;
  search: string;
  tab: ChatListTab;
  draftByChatId: Record<string, string>;
  typingByChatId: Record<string, boolean>;
}

const initialState: ChatUiState = {
  activeChatId: null,
  search: "",
  tab: "all",
  draftByChatId: {},
  typingByChatId: {},
};

const chatUiSlice = createSlice({
  name: "chatUi",
  initialState,
  reducers: {
    setActiveChat(state, action: PayloadAction<string | null>) {
      state.activeChatId = action.payload;
    },
    setChatSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setChatTab(state, action: PayloadAction<ChatListTab>) {
      state.tab = action.payload;
    },
    setChatDraft(
      state,
      action: PayloadAction<{ chatId: string; text: string }>,
    ) {
      state.draftByChatId[action.payload.chatId] = action.payload.text;
    },
    clearChatDraft(state, action: PayloadAction<string>) {
      delete state.draftByChatId[action.payload];
    },
    setChatTyping(
      state,
      action: PayloadAction<{ chatId: string; isTyping: boolean }>,
    ) {
      state.typingByChatId[action.payload.chatId] = action.payload.isTyping;
    },
    resetChatUi() {
      return initialState;
    },
  },
});

export const {
  setActiveChat,
  setChatSearch,
  setChatTab,
  setChatDraft,
  clearChatDraft,
  setChatTyping,
  resetChatUi,
} = chatUiSlice.actions;

export default chatUiSlice.reducer;
