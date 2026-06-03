import { useState } from 'react'

interface Props {
  onLogin: (secret: string) => void
}

export function LoginPage({ onLogin }: Props) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(false)

    try {
      // 認証確認: 存在しないIDへのDELETEで401かどうかを判定
      // GETは認証不要なので、DELETEで確認する
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL ?? '/api'}/areas/__auth_check__`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${password}`,
          },
        }
      )

      if (res.status === 401) {
        // 認証失敗
        setError(true)
      } else {
        // 401以外（404 not found など）= パスワードOK
        sessionStorage.setItem('admin_secret', password)
        onLogin(password)
      }
    } catch (e) {
      setError(true)
      console.error('Login error:', e)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-night flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-[11px] tracking-[0.2em] text-gold uppercase mb-2">vrmap</p>
          <h1 className="text-2xl font-black text-white">管理画面</h1>
          <p className="text-white/40 text-sm mt-1">パスワードを入力してください</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-white/10 p-6 space-y-4">
          <div>
            <label className="block text-xs text-white/50 mb-1.5">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-brand transition-colors"
              placeholder="ADMIN_SECRET で設定したパスワード"
              autoFocus
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-900/20 border border-red-500/20 rounded-lg px-3 py-2">
              パスワードが違います。またはサーバーに接続できませんでした。
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-2.5 bg-brand hover:bg-brand-dark disabled:opacity-50 rounded-lg text-sm font-bold text-white transition-colors"
          >
            {loading ? '確認中...' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  )
}
