export type OnyxProject = {
  chat_sessions: unknown[];
  created_at: string;
  description: string | null;
  id: number;
  instructions: string | null;
  name: string;
  user_id: string | null;
};

export type OnyxUserFile = {
  chat_file_type: string;
  chunk_count: number | null;
  created_at: string;
  file_id: string;
  file_type: string | null;
  id: string;
  last_accessed_at: string | null;
  name: string;
  project_id: number | null;
  status: string;
  temp_id: string | null;
  token_count: number | null;
  user_id: string | null;
};

export type OnyxRejectedFile = {
  file_name: string;
  reason: string;
};

export type OnyxUploadResult = {
  rejected_files: OnyxRejectedFile[];
  user_files: OnyxUserFile[];
};

export type OnyxApiKeyDescriptor = {
  api_key?: string;
  api_key_display: string;
  api_key_id: number;
  api_key_name: string | null;
  api_key_role: string;
  user_id: string;
};

export type OnyxCredential = {
  bearerToken: string;
  onyxUserId: string;
};

export type OnyxChatResponse = {
  answer: string;
  answer_citationless: string;
  chat_session_id: string | null;
  citation_info: unknown[];
  error_msg: string | null;
  message_id: number;
  top_documents: unknown[];
};
