import { useEffect, useRef } from 'react'
import type { Seat } from '@/types'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pannellum: any
  }
}

interface Props {
  seat: Seat | null
  onClose: () => void
  onBack: () => void   // 拡大マップに戻る
}

export function PanoramaModal({ seat, onClose, onBack }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viewerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!seat || !containerRef.current) return
    if (viewerRef.current) {
      try { viewerRef.current.destroy() } catch (_) { /* noop */ }
      viewerRef.current = null
    }
    if (!seat.pano_url) return

    // 360°画像はここで初めてfetch（遅延）
    viewerRef.current = window.pannellum.viewer(containerRef.current, {
      type: 'equirectangular',
      panorama: seat.pano_url,
      autoLoad: true,
      autoRotate: -2,
      compass: false,
      showZoomCtrl: true,
      showFullscreenCtrl: true,
      pitch: seat.pitch ?? 0,
      yaw: seat.yaw ?? 0,
      hfov: seat.hfov ?? 100,
      strings: {
        loadingLabel: '読み込み中...',
        loadError: '画像を読み込めませんでした',
      },
    })

    return () => {
      if (viewerRef.current) {
        try { viewerRef.current.destroy() } catch (_) { /* noop */ }
        viewerRef.current = null
      }
    }
  }, [seat])

  if (!seat) return null

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm" aria-hidden="true" />

      <div
        className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="
          w-full max-w-2xl rounded-2xl overflow-hidden
          bg-surface border border-white/10
          shadow-2xl shadow-black/70
          flex flex-col
          animate-[fadeUp_0.2s_ease]
        ">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-brand to-brand-dark flex-shrink-0">
            <div className="flex items-center gap-3">
              {/* 戻るボタン */}
              <button
                onClick={onBack}
                className="flex items-center gap-1 text-white/70 hover:text-white text-xs transition-colors"
                aria-label="拡大マップに戻る"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                マップに戻る
              </button>
              <span className="text-white/30">|</span>
              <div>
                <p className="text-[10px] text-white/60 tracking-widest uppercase mb-0.5">360° Panorama View</p>
                <p className="text-white font-bold text-sm sm:text-base">{seat.label}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center text-lg transition-colors"
              aria-label="閉じる"
            >
              ×
            </button>
          </div>

          {/* 360°ビューア */}
          {seat.pano_url ? (
            <div ref={containerRef} className="w-full h-56 sm:h-80 bg-black" />
          ) : (
            <div className="w-full h-56 sm:h-80 bg-black flex flex-col items-center justify-center gap-3 text-white/30 text-sm">
              <span className="text-4xl">🌐</span>
              <span>360°画像が設定されていません</span>
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-3 border-t border-white/8 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-shrink-0">
            <p className="text-white/40 text-xs flex-1">{seat.pano_url ? 'ドラッグ / スワイプで視点を動かせます' : ''}</p>

            {/* チケット購入ボタン */}
            {seat.ticket_url && (
              <a
                href={seat.ticket_url}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex items-center justify-center gap-2
                  px-5 py-2.5 rounded-full
                  bg-gold hover:bg-yellow-400
                  text-night font-bold text-sm
                  transition-colors flex-shrink-0
                  shadow-md shadow-black/30
                "
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6"/>
                  <polyline points="16 2 22 2 22 8"/>
                  <line x1="11" y1="13" x2="22" y2="2"/>
                </svg>
                チケットを購入する
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
