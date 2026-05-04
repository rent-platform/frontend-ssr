export type Chat = {
  id: string;
  item_id: string | null;
  deal_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  chat_id: string;
  sender_id: string;
  text: string;
  created_at: string;
};

export type Review = {
  id: string;
  deal_id: string;
  from_user_id: string;
  to_user_id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string | null;
  created_at: string;
  updated_at: string;
};

