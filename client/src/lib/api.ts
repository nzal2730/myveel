const API_BASE = '/api';

export const TOKEN_KEY = 'myveel_token';
export const ACTIVE_VEHICLE_KEY = 'myveel_active_vehicle';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type QueryValue = string | number | boolean | null | undefined;

export function buildQuery(params?: Record<string, QueryValue>): string {
  if (!params) return '';
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

async function request<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (options.body instanceof FormData) {
    body = options.body;
  } else if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: options.method || 'GET',
      headers,
      body,
    });
  } catch {
    throw new ApiError('Unable to reach the MyVeel server. Please check your connection.', 0);
  }

  const contentType = response.headers.get('content-type') || '';
  let payload: any = null;
  if (contentType.includes('application/json')) {
    payload = await response.json().catch(() => null);
  } else {
    payload = await response.text().catch(() => '');
  }

  if (response.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new CustomEvent('myveel:unauthorized'));
  }

  if (!response.ok || (payload && payload.success === false)) {
    const message =
      (payload && typeof payload === 'object' && payload.message) ||
      (typeof payload === 'string' && payload) ||
      `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data as T;
  }

  return payload as T;
}

export const api = {
  get<T = unknown>(path: string, params?: Record<string, QueryValue>) {
    return request<T>(`${path}${buildQuery(params)}`);
  },
  post<T = unknown>(path: string, body?: unknown) {
    return request<T>(path, { method: 'POST', body });
  },
  put<T = unknown>(path: string, body?: unknown) {
    return request<T>(path, { method: 'PUT', body });
  },
  patch<T = unknown>(path: string, body?: unknown) {
    return request<T>(path, { method: 'PATCH', body });
  },
  delete<T = unknown>(path: string) {
    return request<T>(path, { method: 'DELETE' });
  },
};

export async function uploadVehiclePhoto(file: File): Promise<string> {
  const form = new FormData();
  form.append('photo', file);
  const token = localStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${API_BASE}/vehicles/upload-photo`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload || payload.success === false) {
    throw new ApiError((payload && payload.message) || 'Photo upload failed.', response.status);
  }
  return payload.photoUrl as string;
}

export async function downloadVehicleReport(
  vehicleId: string,
  sections: Record<string, boolean>
): Promise<void> {
  const token = localStorage.getItem(TOKEN_KEY);
  const query = buildQuery(
    Object.fromEntries(Object.entries(sections).map(([key, value]) => [key, String(value)]))
  );
  const response = await fetch(`${API_BASE}/reports/vehicle/${vehicleId}${query}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new ApiError((payload && payload.message) || 'Failed to generate report.', response.status);
  }

  const blob = await response.blob();
  const disposition = response.headers.get('content-disposition') || '';
  const match = disposition.match(/filename="?([^"]+)"?/);
  const fileName = match ? match[1] : `MyVeel_Report_${vehicleId}.pdf`;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1200);
}
