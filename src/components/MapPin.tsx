import type { Area } from '@/types'

interface Props {
  area: Area
  onClick: (area: Area) => void
}

export function MapPin({ area, onClick }: Props) {
  return (
    <button
      className="absolute -translate-x-1/2 -translate-y-1/2 group z-10"
      style={{ left: `${area.x}%`, top: `${area.y}%` }}
      onClick={() => onClick(area)}
      aria-label={area.label}
    >
      <span className="
        block px-2.5 py-1 rounded-full text-white text-[11px] font-bold
        whitespace-nowrap leading-snug text-center
        bg-brand shadow-md shadow-black/40
        ring-1 ring-white/15
        transition-transform duration-150
        group-hover:scale-110 group-hover:bg-brand-dark
        active:scale-95
      ">
        {area.label}
      </span>
    </button>
  )
}
