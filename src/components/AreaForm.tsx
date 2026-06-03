import { useState } from 'react'
import { api } from '@/lib/api'
import type { Area, AreaFormData } from '@/types'

interface Props {
  initialData?: Area
  onSubmit: (data: AreaFormData) => void
  onCancel: () => void
  busy?: boolean
}

const DEFAULTS: AreaFormData = { label: '', x: 50, y: 50, desc: '', detail_map_url: null }

export function AreaForm({ initialData, onSubmit, onCancel, busy }: Props) {
  const [form, setForm] = useState<AreaFormData>(
    initialData
      ? { label: initialData.label, x: initialData.x, y: initialData.y, desc: initialData.desc, detail_map_url: initialData.detail_map_url }
      : DEFAULTS
  )
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const set = <K extends keyof AreaFormData>(key: K, value: AreaFormData[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setUploadError(null)
    const res = await api.upload.presign(file.name, file.type)
    if (res.error || !res.data) { setUploadError('アップロードURLの取得に失敗'); setUploading(false); return }
    const r = await fetch(res.data.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
    if (!r.ok) setUploadError('アップロード失敗')
    else set('detail_map_url', res.data.publicUrl)
    setUploading(false)
  }

  const input = 'w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand transition-colors'
  const lbl = 'block text-xs text-white/50 mb-1'

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={lbl}>エリア名 <span className="text-brand">*</span></label>
          <input className={input} value={form.label} onChange={e => set('label', e.target.value)} placeholder="例: フードコートエリア" required />
        </div>
        <div>
          <label className={lbl}>X 位置（会場マップ %）</label>
          <input type="number" min={0} max={100} step={0.1} className={input} value={form.x} onChange={e => set('x', parseFloat(e.target.value))} />
        </div>
        <div>
          <label className={lbl}>Y 位置（会場マップ %）</label>
          <input type="number" min={0} max={100} step={0.1} className={input} value={form.y} onChange={e => set('y', parseFloat(e.target.value))} />
        </div>
        <div className="col-span-2">
          <label className={lbl}>説明文</label>
          <textarea className={`${input} h-16 resize-none`} value={form.desc} onChange={e => set('desc', e.target.value)} placeholder="エリアの説明" />
        </div>
        <div className="col-span-2">
          <label className={lbl}>拡大マップ画像（R2）</label>
          <div className="flex gap-2">
            <input className={`${input} flex-1`} value={form.detail_map_url ?? ''} onChange={e => set('detail_map_url', e.target.value || null)} placeholder="https://... またはファイルを選択" />
            <label className="px-3 py-2 bg-white/8 hover:bg-white/15 rounded-lg text-xs cursor-pointer text-white/70 flex-shrink-0">
              {uploading ? '送信中...' : '📁'}
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
            </label>
          </div>
          {uploadError && <p className="text-red-400 text-xs mt-1">{uploadError}</p>}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={busy || uploading} className="px-5 py-2 bg-brand hover:bg-brand-dark disabled:opacity-50 rounded-lg text-sm font-bold transition-colors">
          {busy ? '保存中...' : initialData ? '更新する' : '作成する'}
        </button>
        <button type="button" onClick={onCancel} className="px-5 py-2 bg-white/8 hover:bg-white/15 rounded-lg text-sm transition-colors">キャンセル</button>
      </div>
    </form>
  )
}
