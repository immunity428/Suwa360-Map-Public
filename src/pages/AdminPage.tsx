import { useState } from 'react'
import { useAreas, useSeats } from '@/hooks/useAreas'
import { api } from '@/lib/api'
import { AreaForm } from '@/components/AreaForm'
import { SeatForm } from '@/components/SeatForm'
import type { Area, AreaFormData, Seat, SeatFormData } from '@/types'

interface Props {
  onLogout: () => void
}

export function AdminPage({ onLogout }: Props) {
  const { areas, loading: aLoading, refetch: refetchAreas } = useAreas()
  const [expandedArea, setExpandedArea] = useState<string | null>(null)
  const [editArea, setEditArea] = useState<Area | null>(null)
  const [showCreateArea, setShowCreateArea] = useState(false)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const notify = (type: 'ok' | 'err', text: string) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 5000)
  }

  const createArea = async (data: AreaFormData) => {
    setBusy(true)
    const res = await api.areas.create(data)
    if (res.error) notify('err', `エリア作成失敗: ${res.error}`)
    else { notify('ok', 'エリアを作成しました'); setShowCreateArea(false); refetchAreas() }
    setBusy(false)
  }

  const updateArea = async (data: AreaFormData) => {
    if (!editArea) return
    setBusy(true)
    const res = await api.areas.update(editArea.id, data)
    if (res.error) notify('err', `更新失敗: ${res.error}`)
    else { notify('ok', '更新しました'); setEditArea(null); refetchAreas() }
    setBusy(false)
  }

  const deleteArea = async (area: Area) => {
    if (!confirm(`「${area.label}」と全座席を削除しますか？`)) return
    setBusy(true)
    const res = await api.areas.delete(area.id)
    if (res.error) notify('err', `削除失敗: ${res.error}`)
    else { notify('ok', '削除しました'); refetchAreas() }
    setBusy(false)
  }

  return (
    <div className="min-h-screen bg-night text-white font-sans">
      {/* Header */}
      <header className="px-6 py-4 bg-surface border-b border-white/8 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-white/40 tracking-widest uppercase">vrmap</p>
          <h1 className="text-lg font-bold">管理画面</h1>
        </div>
        <div className="flex items-center gap-4">
          <a href="/" className="text-xs text-white/40 hover:text-white underline">← マップへ戻る</a>
          <button
            onClick={onLogout}
            className="text-xs px-3 py-1.5 bg-white/8 hover:bg-white/15 rounded-lg transition-colors text-white/60"
          >
            ログアウト
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg max-w-sm ${
            toast.type === 'ok' ? 'bg-green-600' : 'bg-red-700'} text-white`}>
            <p className="break-all">{toast.text}</p>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-white/80">エリア一覧</h2>
          <button onClick={() => setShowCreateArea(true)}
            className="px-4 py-2 bg-brand hover:bg-brand-dark rounded-lg text-sm font-bold transition-colors">
            ＋ エリアを追加
          </button>
        </div>

        {showCreateArea && (
          <div className="mb-6 p-5 bg-surface rounded-xl border border-white/10">
            <h3 className="font-bold mb-4 text-white/80">新規エリア作成</h3>
            <AreaForm onSubmit={createArea} onCancel={() => setShowCreateArea(false)} busy={busy} />
          </div>
        )}

        {aLoading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <div className="space-y-3">
          {areas.map(area => (
            <AreaRow
              key={area.id}
              area={area}
              expanded={expandedArea === area.id}
              onToggle={() => setExpandedArea(expandedArea === area.id ? null : area.id)}
              onEdit={() => setEditArea(area)}
              onDelete={() => deleteArea(area)}
              editing={editArea?.id === area.id}
              editForm={
                editArea?.id === area.id
                  ? <AreaForm initialData={area} onSubmit={updateArea} onCancel={() => setEditArea(null)} busy={busy} />
                  : null
              }
              notify={notify}
            />
          ))}
          {!aLoading && areas.length === 0 && (
            <p className="text-center text-white/30 py-12 text-sm">エリアがありません。「＋ エリアを追加」から作成してください。</p>
          )}
        </div>
      </main>
    </div>
  )
}

function AreaRow({ area, expanded, onToggle, onEdit, onDelete, editing, editForm, notify }: {
  area: Area
  expanded: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
  editing: boolean
  editForm: React.ReactNode
  notify: (type: 'ok' | 'err', text: string) => void
}) {
  const { seats, loading: sLoading, refetch: refetchSeats } = useSeats(expanded ? area.id : null)
  const [showCreateSeat, setShowCreateSeat] = useState(false)
  const [editSeat, setEditSeat] = useState<Seat | null>(null)
  const [busy, setBusy] = useState(false)

  const createSeat = async (data: SeatFormData) => {
    setBusy(true)
    const res = await api.seats.create(data)
    if (res.error) notify('err', `座席作成失敗: ${res.error}`)
    else { notify('ok', '座席を追加しました'); setShowCreateSeat(false); refetchSeats() }
    setBusy(false)
  }

  const updateSeat = async (data: SeatFormData) => {
    if (!editSeat) return
    setBusy(true)
    const res = await api.seats.update(editSeat.id, data)
    if (res.error) notify('err', `更新失敗: ${res.error}`)
    else { notify('ok', '更新しました'); setEditSeat(null); refetchSeats() }
    setBusy(false)
  }

  const deleteSeat = async (seat: Seat) => {
    if (!confirm(`「${seat.label}」を削除しますか？`)) return
    setBusy(true)
    const res = await api.seats.delete(seat.id)
    if (res.error) notify('err', `削除失敗: ${res.error}`)
    else { notify('ok', '削除しました'); refetchSeats() }
    setBusy(false)
  }

  return (
    <div className="bg-surface rounded-xl border border-white/8 overflow-hidden">
      {editing ? (
        <div className="p-5">{editForm}</div>
      ) : (
        <div className="flex items-center gap-3 p-4">
          <div className="w-16 h-11 rounded-lg bg-black/40 flex-shrink-0 overflow-hidden">
            {area.detail_map_url
              ? <img src={area.detail_map_url} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-white/20 text-[10px]">マップなし</div>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">{area.label}</p>
            <p className="text-[10px] text-white/40 mt-0.5 truncate">{area.desc}</p>
            <p className="text-[10px] text-white/30 mt-0.5">X:{area.x}% Y:{area.y}%</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={onToggle}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${expanded ? 'bg-brand/20 text-brand' : 'bg-white/8 hover:bg-white/15'}`}>
              {expanded ? '▲ 閉じる' : '▼ 座席管理'}
            </button>
            <button onClick={onEdit} className="px-3 py-1.5 bg-white/8 hover:bg-white/15 rounded-lg text-xs">編集</button>
            <button onClick={onDelete} className="px-3 py-1.5 bg-red-900/40 hover:bg-red-700/60 rounded-lg text-xs text-red-300">削除</button>
          </div>
        </div>
      )}

      {/* 座席リスト */}
      {expanded && !editing && (
        <div className="border-t border-white/8 bg-black/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/50 font-bold">座席一覧</p>
            <button onClick={() => setShowCreateSeat(true)}
              className="px-3 py-1 bg-gold/20 hover:bg-gold/30 text-gold rounded-lg text-xs font-bold transition-colors">
              ＋ 座席を追加
            </button>
          </div>

          {showCreateSeat && (
            <div className="p-4 bg-surface rounded-xl border border-white/10">
              <p className="text-xs font-bold mb-3 text-white/60">新規座席</p>
              <SeatForm areaId={area.id} onSubmit={createSeat} onCancel={() => setShowCreateSeat(false)} busy={busy} />
            </div>
          )}

          {sLoading && (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!sLoading && seats.length === 0 && !showCreateSeat && (
            <p className="text-center text-white/30 text-xs py-4">座席が登録されていません</p>
          )}

          {seats.map(seat => (
            <div key={seat.id} className="bg-surface rounded-xl border border-white/8 overflow-hidden">
              {editSeat?.id === seat.id ? (
                <div className="p-4">
                  <SeatForm areaId={area.id} initialData={seat} onSubmit={updateSeat} onCancel={() => setEditSeat(null)} busy={busy} />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3">
                  <div className="w-14 h-10 rounded-lg bg-black/40 flex-shrink-0 overflow-hidden">
                    {seat.pano_url
                      ? <img src={seat.pano_url} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-white/20 text-[9px]">360なし</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">{seat.label}</p>
                    <p className="text-[10px] text-white/40">X:{seat.x}% Y:{seat.y}%{seat.ticket_url ? ' 🎟' : ''}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => setEditSeat(seat)} className="px-2.5 py-1.5 bg-white/8 hover:bg-white/15 rounded-lg text-xs">編集</button>
                    <button onClick={() => deleteSeat(seat)} className="px-2.5 py-1.5 bg-red-900/40 hover:bg-red-700/60 rounded-lg text-xs text-red-300">削除</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
