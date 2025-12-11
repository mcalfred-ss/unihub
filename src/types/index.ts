export interface Post {
  id: string
  uploader: string | null
  program_name: string
  year: string | null
  school: string | null
  type: string | null
  title: string | null
  storage_path: string
  file_name: string | null
  file_size: number | null
  mime_type: string | null
  is_public: boolean
  created_at: string
}

export interface UploadPostParams {
  file: File
  program_name: string
  year: string
  school: string
  type?: string
  title?: string
}

export interface CreatePostPayload {
  uploader: null
  program_name: string
  year: string
  school: string
  type: string
  title: string
  storage_path: string
  file_name: string
  file_size: number
  mime_type: string
  is_public: boolean
}

