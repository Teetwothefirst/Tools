const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface TaskStatusResponse {
  task_id: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  progress: number;
  download_url?: string | null;
  error?: string | null;
}

export interface TaskInitResponse {
  task_id: string;
  status: string;
  message: string;
}

export async function uploadForConversion(
  endpoint: 'convert/pdf-to-word' | 'convert/word-to-pdf' | 'repair/pdf',
  file: File
): Promise<TaskInitResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(errData.detail || `Upload failed with status ${res.status}`);
  }

  return res.json();
}

export async function uploadForOcr(
  file: File,
  options: { language?: string; deskew?: boolean; clean?: boolean } = {}
): Promise<TaskInitResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', options.language || 'eng');
  formData.append('deskew', String(options.deskew ?? true));
  formData.append('clean', String(options.clean ?? true));

  const res = await fetch(`${API_BASE_URL}/ocr/pdf-to-searchable`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: 'OCR Processing Request Failed' }));
    throw new Error(errData.detail || `OCR failed with status ${res.status}`);
  }

  return res.json();
}

export async function pollTaskStatus(taskId: string): Promise<TaskStatusResponse> {
  const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`);
  
  if (!res.ok) {
    throw new Error(`Failed to fetch task status for ${taskId}`);
  }

  return res.json();
}

export function getFullDownloadUrl(downloadPath: string): string {
  if (downloadPath.startsWith('http')) return downloadPath;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '') : 'http://localhost:8000';
  return `${baseUrl}${downloadPath}`;
}
