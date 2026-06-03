import { useState } from 'react'
import { api } from '@/lib/api'
import type { Seat, SeatFormData } from '@/types'

interface Props {
  areaId: string
  initialData?: Seat
  onSubmit: (data: SeatFormData) => void
  onCancel: () => void
  busy?: boolean
}

const DEFAULTS = (areaId: string): SeatFormData => ({
  area_id: areaId,
  label: '',
  x: 50, y: 50,
  pano_url: null,
  ticket_url: null,
  pitch: 0, yaw: 0, hfov: 100,
})

export function SeatForm({ areaId, initialData, onSubmit, onCancel, busy }: Props) {
  const [form, setForm] = useState<SeatFormData>(
    initialData
      ? { area_id: initialData.area_id, label: initialData.label, x: initialData.x, y: initialData.y,
          pano_url: initialData.pano_url, ticket_url: initialData.ticket_url,
          pitch: initialData.pitch, yaw: initialData.yaw, hfov: initialData.hfov }
      : DEFAULTS(areaId)
  )
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const set = <K extends keyof SeatFormData>(key: K, value: SeatFormData[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setUploadError(null)
    const res = await api.upload.presign(file.name, file.type)
    if (res.error || !res.data) { setUploadError('アップロードURLの取得に失敗'); setUploading(false); return }
    const { uploadUrl, publicUrl } = res.data
    const r = await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
    if (!r.ok) setUploadError('アップロード失敗')
    else set('pano_url', publicUrl)
    setUploading(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ ...form, ticket_url: form.ticket_url === '' ? null : form.ticket_url })
  }

  const input = 'w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors'
  const label = 'block text-xs text-white/50 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={label}>座席名 <span className="text-brand">*</span></label>
          <input className={input} value={form.label} onChange={e => set('label', e.target.value)}
            placeholder="例: A列1番" required />
        </div>
        <div>
          <label className={label}>X 位置（拡大マップ上 %）</label>
          <input type="number" min={0} max={100} step={0.1} className={input}
            value={form.x} onChange={e => set('x', parseFloat(e.target.value))} />
        </div>
        <div>
          <label className={label}>Y 位置（拡大マップ上 %）</label>
          <input type="number" min={0} max={100} step={0.1} className={input}
            value={form.y} onChange={e => set('y', parseFloat(e.target.value))} />
        </div>
        <div className="col-span-2">
          <label className={label}>360°画像（R2）</label>
          <div className="flex gap-2">
            <input className={`${input} flex-1`} value={form.pano_url ?? ''} onChange={e => set('pano_url', e.target.value || null)}
              placeholder="https://... またはファイルを選択" />
            <label className="px-3 py-2 bg-white/8 hover:bg-white/15 rounded-lg text-xs cursor-pointer text-white/70 flex-shrink-0">
              {uploading ? '送信中...' : '📁'}
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
            </label>
          </div>
          {uploadError && <p className="text-red-400 text-xs mt-1">{uploadError}</p>}
        </div>
        <div className="col-span-2">
          <label className={label}>🎟 チケット購入URL（任意）</label>
          <input type="url" className={input} value={form.ticket_url ?? ''} onChange={e => set('ticket_url', e.target.value || null)}
            placeholder="https://ticket.example.com/..." />
        </div>
        <div>
          <label className={label}>Pitch</label>
          <input type="number" min={-90} max={90} className={input} value={form.pitch} onChange={e => set('pitch', parseFloat(e.target.value))} />
        </div>
        <div>
          <label className={label}>Yaw</label>
          <input type="number" min={-180} max={180} className={input} value={form.yaw} onChange={e => set('yaw', parseFloat(e.target.value))} />
        </div>
        <div>
          <label className={label}>Hfov</label>
          <input type="number" min={30} max={150} className={input} value={form.hfov} onChange={e => set('hfov', parseFloat(e.target.value))} />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={busy || uploading}
          className="px-5 py-2 bg-brand hover:bg-brand-dark disabled:opacity-50 rounded-lg text-sm font-bold transition-colors">
          {busy ? '保存中...' : initialData ? '更新する' : '追加する'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-5 py-2 bg-white/8 hover:bg-white/15 rounded-lg text-sm transition-colors">
          キャンセル
        </button>
      </div>
    </form>
  )
}
