import { useRef, useState, useEffect } from 'react'

interface Props {
  src: string
  alt: string
  className?: string
}

/**
 * Intersection Observer で viewport に入った瞬間だけ読み込む遅延画像
 */
export function LazyImage({ src, alt, className }: Props) {
  const ref = useRef<HTMLImageElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [actualSrc, setActualSrc] = useState('')

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActualSrc(src)
          observer.disconnect()
        }
      },
      { rootMargin: '100px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [src])

  return (
    <div className={`relative overflow-hidden bg-black/30 ${className ?? ''}`}>
      {/* スケルトン */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-white/5" />
      )}
      <img
        ref={ref}
        src={actualSrc}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}
