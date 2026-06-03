import type { Area, AreaFormData, Seat, SeatFormData, ApiResponse } from '@/types'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

// セッションからシークレットを取得
function getSecret(): string {
  return sessionStorage.getItem('admin_secret') ?? ''
}

async function request<T>(path: string, options?: RequestInit, withAuth = false): Promise<ApiResponse<T>> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string>),
    }
    if (withAuth) {
      headers['Authorization'] = `Bearer ${getSecret()}`
    }

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

    if (!res.ok) {
      const text = await res.text()
      // エラー詳細をそのまま返す
      return { error: `[${res.status}] ${text || res.statusText}` }
    }
    return { data: await res.json() as T }
  } catch (e) {
    return { error: `ネットワークエラー: ${String(e)}` }
  }
}

export const api = {
  areas: {
    list:   ()                              => request<Area[]>('/areas'),
    get:    (id: string)                    => request<Area>(`/areas/${id}`),
    create: (body: AreaFormData)            => request<Area>('/areas', { method: 'POST', body: JSON.stringify(body) }, true),
    update: (id: string, body: Partial<AreaFormData>) =>
      request<Area>(`/areas/${id}`, { method: 'PUT', body: JSON.stringify(body) }, true),
    delete: (id: string)                    => request<{ ok: boolean }>(`/areas/${id}`, { method: 'DELETE' }, true),
  },

  seats: {
    listByArea: (areaId: string)            => request<Seat[]>(`/areas/${areaId}/seats`),
    create:     (body: SeatFormData)        => request<Seat>('/seats', { method: 'POST', body: JSON.stringify(body) }, true),
    update:     (id: string, body: Partial<SeatFormData>) =>
      request<Seat>(`/seats/${id}`, { method: 'PUT', body: JSON.stringify(body) }, true),
    delete:     (id: string)                => request<{ ok: boolean }>(`/seats/${id}`, { method: 'DELETE' }, true),
  },

  upload: {
    presign: (filename: string, contentType: string) =>
      request<{ uploadUrl: string; publicUrl: string }>('/upload/presign', {
        method: 'POST',
        body: JSON.stringify({ filename, contentType }),
      }, true),
  },
}
