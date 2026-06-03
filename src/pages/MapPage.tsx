import { useState } from 'react'
import { MapPin } from '@/components/MapPin'
import { AreaMapModal } from '@/components/AreaMapModal'
import { PanoramaModal } from '@/components/PanoramaModal'
import { useAreas } from '@/hooks/useAreas'
import type { Area, Seat } from '@/types'

const MAP_IMAGE = '/map.png'

export function MapPage() {
  const { areas, loading, error } = useAreas()

  // ステップ管理
  const [selectedArea, setSelectedArea] = useState<Area | null>(null)   // 拡大マップ表示中
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null)   // 360°表示中

  const handleAreaClick = (area: Area) => {
    setSelectedArea(area)
    setSelectedSeat(null)
  }

  const handleSeatSelect = (seat: Seat) => {
    setSelectedSeat(seat)
    // AreaMapModalは裏に残したままにする（戻れるように）
  }

  const handleBackToAreaMap = () => {
    setSelectedSeat(null)   // 360°を閉じて拡大マップに戻る
  }

  const handleCloseAll = () => {
    setSelectedSeat(null)
    setSelectedArea(null)
  }

  return (
    <div className="min-h-screen bg-night text-white font-sans">
      {/* Header */}
      <header className="relative text-center py-8 sm:py-10 px-4 bg-gradient-to-b from-night to-[#12101e] border-b border-white/8 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{background:'radial-gradient(ellipse 60% 80% at 20% 50%,rgba(204,30,36,0.07) 0%,transparent 70%),radial-gradient(ellipse 60% 80% at 80% 50%,rgba(232,184,75,0.05) 0%,transparent 70%)'}}
        />
        <p className="text-[11px] tracking-[0.2em] text-gold uppercase mb-1.5">Suwa Lake Fireworks Festival</p>
        <h1 className="text-2xl sm:text-4xl font-black leading-tight mb-1">
          諏訪湖<span className="text-gold">花火</span>大会<br className="sm:hidden" /> 会場マップ
        </h1>
        <p className="text-xs sm:text-sm text-white/50">エリアのピンをタップして座席からの景色を確認できます</p>
      </header>

      {/* フロー説明バッジ */}
      <div className="flex items-center justify-center gap-2 py-3 text-[11px] text-white/30">
        <span className="px-2 py-0.5 rounded bg-white/6">① エリアを選択</span>
        <span>→</span>
        <span className="px-2 py-0.5 rounded bg-white/6">② 座席を選択</span>
        <span>→</span>
        <span className="px-2 py-0.5 rounded bg-white/6">③ 360° で確認</span>
      </div>

      {/* Map */}
      <main className="max-w-5xl mx-auto px-0 sm:px-4 mb-8">
        <div className="relative rounded-none sm:rounded-xl overflow-hidden border-y sm:border border-white/8 shadow-[0_0_60px_rgba(204,30,36,0.12)]">
          <img
            src={MAP_IMAGE}
            alt="会場概略図"
            className="w-full block"
            draggable={false}
          />

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {error && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
              <p className="text-white/50 text-xs bg-black/60 px-3 py-1.5 rounded-full">エリア情報を取得できませんでした</p>
            </div>
          )}

          {/* エリアピン（クリックで拡大マップへ） */}
          {!loading && areas.map(area => (
            <MapPin key={area.id} area={area} onClick={handleAreaClick} />
          ))}
        </div>

        {/* Legend */}
        {!loading && areas.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 px-4 sm:px-0">
            {areas.map(area => (
              <button
                key={area.id}
                onClick={() => handleAreaClick(area)}
                className="flex items-center gap-1.5 bg-surface border border-white/8 rounded-full px-3 py-1.5 text-[11px] text-white/50 hover:border-brand hover:text-white transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-brand flex-shrink-0" />
                {area.label}
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Step1: 拡大マップモーダル（座席選択まで表示し続ける） */}
      {!selectedSeat && (
        <AreaMapModal
          area={selectedArea}
          onClose={handleCloseAll}
          onSeatSelect={handleSeatSelect}
        />
      )}

      {/* Step2: 360°ビューアモーダル（拡大マップの上に重ねる） */}
      <PanoramaModal
        seat={selectedSeat}
        onClose={handleCloseAll}
        onBack={handleBackToAreaMap}
      />

      <footer className="text-center py-6 text-xs text-white/30 border-t border-white/8">
        諏訪湖花火大会 会場マップ — powered by{' '}
        <a href="https://pannellum.org/" target="_blank" rel="noopener noreferrer" className="underline">Pannellum</a>
      </footer>
    </div>
  )
}
