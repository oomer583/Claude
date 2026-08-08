export type OnyxProject = {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  user_id: string | null;
  instructions: string | null;
  chat_sessions: unknown[];
};

export type OnyxUserFile = {
  id: string;
  temp_id: string | null;
  name: string;
  project_id: number | null;
  user_id: string | null;
  file_id: string;
  created_at: string;
  status: string;
  last_accessed_at: string | null;
  file_type: string | null;
  chat_file_type: string;
  token_count: number | null;
  chunk_count: number | null;
};

export type OnyxRejectedFile = {
  file_name: string;
  reason: string;
};

export type OnyxUploadResult = {
  user_files: OnyxUserFile[];
  rejected_files: OnyxRejectedFile[];
};

export type OnyxApiKeyDescriptor = {
  api_key_id: number;
  api_key_display: string;
  api_key?: string;
  api_key_name: string | null;
  api_key_role: string;
  user_id: string;
};

export type OnyxCredential = {
  bearerToken: string;
  onyxUserId: string;
};
