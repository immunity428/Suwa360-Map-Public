# vrmap

花火大会の座席からの景色を、事前に360°パノラマで確認できるWebサービスです。

---

## 背景

### 課題

諏訪湖花火大会のチケット販売において、既存の座席紹介サイトでは以下の問題が発生していました。

- **木・建物などの障害物**により、座席によっては花火が見切れてしまうケースがある
- 購入後に「思っていた眺めと違う」というクレームが継続的に発生していた
- **静止画による場所の写真のみ**の掲載で、実際の見え方・雰囲気が伝わりにくい
- **実際の現地との乖離**があり、サイト上の情報と現地の状況が一致しないケースがある

これらの課題は、座席の「見え方」が購入前にわからないことに起因しています。

### 解決策

**Insta360** を使い各座席エリアを360°撮影し、会場マップ上のピンに紐づけて公開することで、来場者がチケット購入前に実際の視点から花火の見え方を体感できるようにしました。

---

## サービス概要

会場マップ上のエリアピンをタップすると拡大マップが表示され、さらに座席ピンをタップすると360°パノラマビューアが起動します。ドラッグ・スワイプで視点を自由に動かすことができ、チケット購入ボタンも同一画面内に配置しています。

### 利用フロー

```
会場マップ（エリアピン）
  ↓ タップ
エリア拡大マップ（座席ピン）
  ↓ タップ
360°パノラマビューア + チケット購入ボタン
```

---

## 機能

- 会場マップ上にエリアピンを表示
- エリアタップで拡大マップを表示（画像は遅延読み込み）
- 座席タップで360°パノラマビューアを起動（Pannellum）
- ドラッグ／スワイプで視点を自由に操作
- チケット購入サイトへのリンクボタン
- 管理画面からエリア・座席・画像・リンクを編集可能（非エンジニア対応）
- スマホ（iPhone）対応のレスポンシブレイアウト
- 画像の遅延読み込みによる初期表示の高速化

---

## 技術選定

### 選定の観点

| 観点 | 内容 |
|---|---|
| **規約** | 商用・業務利用における利用規約のグレーゾーンをなくす |
| **管理コスト** | 運用・保守にかかる工数を最小化する |
| **コーディング難易度** | 後任担当者が引き継ぎやすい技術を選ぶ |
| **内部仕様** | 帯域・同時アクセス数・同時利用人数への対応 |
| **継続性** | サービス停止・値上げリスクの低い選択をする |
| **コスト** | 費用は許容範囲内であれば問題なし |

---

### フロントエンド

| 技術 | 選定理由 |
|---|---|
| **React + Vite** | コンポーネント単位の管理で保守性が高い。Viteにより開発・ビルドが高速 |
| **TypeScript** | 型安全により後任担当者がコードを読みやすく、バグを事前に防げる |
| **Tailwind CSS** | クラス名でスタイルを完結させられるため、CSS管理コストが低い |
| **Pannellum** | 外部サービス依存なし・完全無料・OSSで継続性が高い360°ビューアライブラリ |

---

### ホスティング（デプロイ先）

| サービス | 規約 | 管理コスト | 難易度 | 継続性 | 結論 |
|---|---|---|---|---|---|
| **Vercel Pro** | ✅ 商用利用明確 | 低 | 低 | ◎ | **採用** |
| GitHub Pages | ⚠️ 商用利用グレー | 低 | 低 | ○ | 規約上NG |
| AWS CloudFront+S3 | ✅ 明確 | 高 | 高 | ◎ | 後任継続難易度が高いため不採用 |

Vercel の無料プラン（Hobby）は商用利用が規約上グレーのため、**Vercel Pro** を採用しリスクを排除しました。

---

### ストレージ（360°画像の配信）

| サービス | 規約 | 管理コスト | 難易度 | 帯域コスト | 結論 |
|---|---|---|---|---|---|
| **Cloudflare R2** | ✅ 明確 | 低 | 低〜中 | ✅ egress無料 | **採用** |
| Firebase Storage | ✅ 明確 | 低 | 低 | △ 従量課金 | アクセス集中時のコスト増リスク |
| Supabase Storage | ✅ 明確 | 低 | 低 | △ 従量課金 | アクセス集中時のコスト増リスク |
| AWS S3 | ✅ 明確 | 高 | 高 | △ 従量課金 | 後任継続難易度が高いため不採用 |

360°画像は1ファイルあたり数十MB〜数百MBになるため、**egress（転送）費用が無料**のCloudflare R2を採用しました。花火大会当日のアクセス集中時もコストが跳ね上がりません。

---

### データベース・API

| サービス | 選定理由 |
|---|---|
| **Cloudflare D1** | R2と同じCloudflareで統一でき管理が一元化できる。SQLiteベースで扱いやすい |
| **Cloudflare Workers** | D1・R2と同一プラットフォームでレイテンシが低い。サーバー管理不要 |

---

### 最終アーキテクチャ

```
ユーザー（ブラウザ / スマホ）
  ↓
Vercel Pro
（React + Vite フロントエンド）
  ↓                        ↓
Cloudflare Workers      Cloudflare R2
（REST API）            （360°パノラマ画像）
  ↓
Cloudflare D1
（エリア・座席・リンク情報）
```

---

## 技術スタック

| 用途 | 技術 |
|---|---|
| フロントエンド | React + Vite + TypeScript + Tailwind CSS |
| 360°ビューア | [Pannellum](https://pannellum.org/)（CDN） |
| APIサーバー | Cloudflare Workers |
| データベース | Cloudflare D1（SQLite） |
| 画像ストレージ | Cloudflare R2 |
| ホスティング | Vercel Pro |
| 360°撮影機材 | Insta360 |

---

## ディレクトリ構成

```
vrmap/
├── src/
│   ├── components/
│   │   ├── MapPin.tsx           # 会場マップのエリアピン
│   │   ├── AreaMapModal.tsx     # 拡大マップ + 座席ピン
│   │   ├── PanoramaModal.tsx    # 360°ビューア + チケットボタン
│   │   ├── AreaForm.tsx         # エリア編集フォーム
│   │   ├── SeatForm.tsx         # 座席編集フォーム
│   │   └── LazyImage.tsx        # 遅延読み込み画像
│   ├── pages/
│   │   ├── MapPage.tsx          # メインマップ画面
│   │   ├── AdminPage.tsx        # 管理画面
│   │   └── LoginPage.tsx        # 管理画面ログイン
│   ├── hooks/
│   │   └── useAreas.ts          # エリア・座席データ取得フック
│   ├── lib/
│   │   └── api.ts               # APIクライアント
│   └── types/
│       └── index.ts             # 型定義
├── worker/
│   └── index.ts                 # Cloudflare Workers API
├── schema.sql                   # D1 データベーススキーマ
├── wrangler.toml                # Cloudflare設定
└── .env.example                 # 環境変数サンプル
```

---

## セットアップ手順

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. Cloudflare D1 データベース作成

```bash
# wranglerインストール（未インストールの場合）
npm install -g wrangler

# Cloudflareにログイン
wrangler login

# D1データベース作成
wrangler d1 create vrmap-db
# → 出力された database_id を wrangler.toml に貼り付け

# スキーマをリモートに適用
wrangler d1 execute vrmap-db --remote --file=./schema.sql
```

### 3. Cloudflare R2 バケット作成

```bash
wrangler r2 bucket create vrmap-images
```

Cloudflareダッシュボード → R2 → `vrmap-images` → Settings → **Public Access を有効化**し、発行されたパブリックURLを `wrangler.toml` の `R2_PUBLIC_URL` に設定してください。

### 4. 管理API用パスワード設定

```bash
echo "任意の強力なパスワード" | wrangler secret put ADMIN_SECRET
```

### 5. 環境変数設定

```bash
cp .env.example .env
# VITE_API_BASE_URL に Workers の URL を設定
```

### 6. Workers デプロイ

```bash
wrangler deploy
# → https://vrmap-api.xxxx.workers.dev が発行される
```

### 7. フロントエンド ローカル起動

```bash
npm run dev
# → http://localhost:5173
```

### 8. Vercel へのデプロイ

```bash
npm install -g vercel
vercel
```

Vercelダッシュボード → Settings → Environment Variables に以下を追加してください。

```
VITE_API_BASE_URL = https://vrmap-api.xxxx.workers.dev/api
```

---

## 管理画面

`/admin` にアクセスするとパスワード入力画面が表示されます。`ADMIN_SECRET` で設定したパスワードでログインするとエリア・座席の追加・編集・削除が可能です。

### 管理できる項目

| 項目 | 内容 |
|---|---|
| エリア名・座標 | 会場マップ上のピン位置 |
| 拡大マップ画像 | エリアごとの詳細マップ（R2にアップロード） |
| 座席名・座標 | 拡大マップ上のピン位置 |
| 360°画像 | Insta360で撮影した画像（R2にアップロード） |
| チケット購入URL | 座席ごとの購入リンク |

---

## ライセンス

MIT
#   S u w a 3 6 0 - M a p - P u b l i c  
 