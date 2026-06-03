import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { Area, Seat } from '@/types'

export function useAreas() {
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await api.areas.list()
    if (res.error) setError(res.error)
    else setAreas(res.data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])
  return { areas, loading, error, refetch: fetch }
}

// 座席は「エリアが選択されたとき」だけ取得する遅延ロード
export function useSeats(areaId: string | null) {
  const [seats, setSeats] = useState<Seat[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    setSeats([])
    const res = await api.seats.listByArea(id)
    if (res.error) setError(res.error)
    else setSeats(res.data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (areaId) fetch(areaId)
    else setSeats([])
  }, [areaId, fetch])

  return { seats, loading, error, refetch: () => areaId && fetch(areaId) }
}
