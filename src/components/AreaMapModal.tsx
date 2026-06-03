import { useState } from 'react'
import { useSeats } from '@/hooks/useAreas'
import type { Area, Seat } from '@/types'

interface Props {
  area: Area | null
  onClose: () => void
  onSeatSelect: (seat: Seat) => void
}

export function AreaMapModal({ area, onClose, onSeatSelect }: Props) {
  const { seats, loading } = useSeats(area?.id ?? null)
  const [imgLoaded, setImgLoaded] = useState(false)

  if (!area) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" aria-hidden="true" />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="
          w-full max-w-6xl rounded-none sm:rounded-2xl overflow-hidden
          bg-surface border-0 sm:border border-white/10
          shadow-2xl shadow-black/70
          flex flex-col
          animate-[fadeUp_0.2s_ease]
          h-[100dvh] sm:h-auto sm:max-h-[95vh]
        ">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-brand to-brand-dark flex-shrink-0">
            <div>
              <p className="text-[10px] text-white/60 tracking-widest uppercase mb-0.5">エリア詳細マップ</p>
              <p className="text-white font-bold text-base sm:text-lg">{area.label}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center text-lg transition-colors"
              aria-label="閉じる"
            >
              ×
            </button>
          </div>

          {/* Map + Pins */}
          <div className="relative overflow-auto flex-1">
            {area.detail_map_url ? (
              <>
                {/* スケルトン */}
                {!imgLoaded && (
                  <div className="w-full h-48 sm:h-[60vh] animate-pulse bg-white/5 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {/* 拡大マップ画像（タップ時に初めて読み込む） */}
                <div className="relative">
                  <img
                    src={area.detail_map_url}
                    alt={`${area.label} 拡大マップ`}
                    className={`w-full block transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0 absolute'}`}
                    onLoad={() => setImgLoaded(true)}
                    draggable={false}
                  />

                  {/* 座席ピン（画像読み込み後に表示） */}
                  {imgLoaded && (
                    <>
                      {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                      {seats.map(seat => (
                        <SeatPin key={seat.id} seat={seat} onClick={onSeatSelect} />
                      ))}
                      {!loading && seats.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <p className="text-white/40 text-sm bg-black/60 px-4 py-2 rounded-lg">
                            座席が登録されていません
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="w-full h-64 flex flex-col items-center justify-center gap-3 text-white/30 text-sm bg-black/20">
                <span className="text-4xl">🗺️</span>
                <span>拡大マップが設定されていません</span>
                <span className="text-xs">管理画面から画像をアップロードしてください</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-white/8 flex-shrink-0">
            <p className="text-center text-[10px] text-white/30">
              座席のピンをタップすると360°パノラマで確認できます
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

// ── 座席ピン ──────────────────────────────────────
function SeatPin({ seat, onClick }: { seat: Seat; onClick: (s: Seat) => void }) {
  return (
    <button
      className="absolute -translate-x-1/2 -translate-y-1/2 group z-10"
      style={{ left: `${seat.x}%`, top: `${seat.y}%` }}
      onClick={() => onClick(seat)}
      aria-label={seat.label}
    >
      <span className="
        block px-2 py-1 rounded-full text-white text-[10px] font-bold
        whitespace-nowrap leading-snug
        bg-gold/90 text-night shadow-md shadow-black/40
        ring-1 ring-white/20
        transition-transform duration-150
        group-hover:scale-110 group-hover:bg-gold
        active:scale-95
      ">
        {seat.label}
      </span>
    </button>
  )
}
