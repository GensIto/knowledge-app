# Knowledge App

TanStack Start + Better Auth + Cloudflare D1 + Drizzle ORMで構築された、モダンなフルスタックアプリケーション。

## 機能

- ✅ **認証システム**: Better Authを使用したメール/パスワード認証
- ✅ **TanStack Form**: 型安全なフォーム管理とzodバリデーション統合
- ✅ **zodバリデーション**: Server functionとクライアント側での型安全なバリデーション
- ✅ **SSR対応**: TanStack Startによるサーバーサイドレンダリング
- ✅ **データベース**: Cloudflare D1 (SQLite) + Drizzle ORM
- ✅ **TypeScript**: 完全な型安全性
- ✅ **レスポンシブデザイン**: Tailwind CSS v4を使用したモダンなUI

## セットアップ

### 依存関係のインストール

```bash
npm install
```

### 環境変数の設定

`.dev.vars` ファイルを作成して、以下の環境変数を設定してください：

```bash
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key-here
```

### データベースマイグレーション

ローカル開発環境：

```bash
npm run db:migrate
```

本番環境：

```bash
npm run db:migrate:remote
```

### 開発サーバーの起動

```bash
npm run dev
```

アプリケーションは `http://localhost:3000` で起動します。

## 利用可能なスクリプト

- `npm run dev` - 開発サーバーを起動（ポート3000）
- `npm run build` - 本番用にビルド
- `npm run serve` - ビルドしたアプリケーションをプレビュー
- `npm run test` - テストを実行
- `npm run deploy` - Cloudflare Workersにデプロイ
- `npm run db:gen` - Drizzleマイグレーションファイルを生成
- `npm run db:migrate` - ローカルDBにマイグレーションを適用
- `npm run db:migrate:remote` - リモートDBにマイグレーションを適用
- `npm run db:studio` - Drizzle Studioを起動（ローカルDB）
- `npm run db:studio:prod` - Drizzle Studioを起動（本番DB）

## プロジェクト構成

```
knowledge-app/
├── src/
│   ├── db/
│   │   └── schema.ts           # データベーススキーマ定義
│   ├── lib/
│   │   ├── auth.ts             # Better Authサーバー設定
│   │   ├── auth-client.ts      # Better Authクライアント設定
│   │   ├── auth-actions.ts     # 認証用server function
│   │   └── middleware.ts       # zodバリデーションミドルウェア
│   └── routes/
│       ├── index.tsx           # トップページ
│       ├── signup.tsx          # サインアップページ
│       ├── signin.tsx          # サインインページ
│       ├── dashboard.tsx       # ダッシュボード（認証後）
│       └── api.auth.$.ts       # Better Auth APIルート
├── drizzle/                    # マイグレーションファイル
├── .dev.vars                   # ローカル環境変数
├── wrangler.jsonc              # Cloudflare Workers設定
└── README.md
```

## 認証システム

### サインアップ

`/signup` ページから新規ユーザー登録ができます。

バリデーション要件：
- メールアドレス: 有効な形式
- パスワード: 8文字以上、大文字・小文字・数字を含む
- 名前: 必須、100文字以下

### サインイン

`/signin` ページからログインできます。

### セッション管理

Better Authがセッション管理を自動的に処理します。セッションは以下の方法で取得できます：

```tsx
import { useSession } from '@/lib/auth-client';

function MyComponent() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div>Loading...</div>;
  if (!session) return <div>Not logged in</div>;

  return <div>Hello, {session.user.name}!</div>;
}
```

### TanStack Formの使用

zodバリデーションと統合したフォーム例：

```tsx
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上である必要があります'),
});

function MyForm() {
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onChange: formSchema,
    },
    validatorAdapter: zodValidator(),
    onSubmit: async ({ value }) => {
      // フォーム送信処理
      console.log(value);
    },
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      form.handleSubmit();
    }}>
      <form.Field name="email">
        {(field) => (
          <div>
            <input
              type="email"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors.length > 0 && (
              <span>{field.state.meta.errors[0]}</span>
            )}
          </div>
        )}
      </form.Field>
      <button type="submit" disabled={form.state.isSubmitting}>
        送信
      </button>
    </form>
  );
}
```

### Server Functionでのバリデーション

zodスキーマを使用したバリデーション例：

```typescript
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { validateInput } from '@/lib/middleware';

const mySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const myAction = createServerFn({ method: 'POST' })
  .validator(validateInput(mySchema))
  .handler(async ({ data }) => {
    // dataは自動的にバリデートされます
    return { success: true };
  });
```

## データベーススキーマ

Better Auth用の4つのテーブル：

- `user` - ユーザー情報
- `session` - セッション情報
- `account` - アカウント連携情報
- `verification` - メール認証などの検証用

スキーマの詳細は `src/db/schema.ts` を参照してください。

## デプロイ

Cloudflare Workersにデプロイ：

```bash
npm run deploy
```

デプロイ前に：
1. Cloudflare D1データベースを作成
2. `wrangler.jsonc` でデータベースIDを設定
3. 環境変数を設定（Cloudflareダッシュボード）
4. リモートDBにマイグレーションを適用

## 参考リンク

- **TanStack Start**: https://tanstack.com/start
- **TanStack Form**: https://tanstack.com/form
- **Better Auth**: https://www.better-auth.com
- **Drizzle ORM**: https://orm.drizzle.team/docs/get-started/d1-new
- **Drizzle Studio**: https://zenn.dev/fjimiz/articles/1946ed01c183ef
- **Cloudflare D1**: https://developers.cloudflare.com/d1/

## トラブルシューティング

### データベース接続エラー

ローカル開発環境でデータベース接続エラーが発生する場合：

1. マイグレーションが適用されているか確認
2. `.dev.vars` ファイルが正しく設定されているか確認
3. 開発サーバーを再起動

### セッションが取得できない

Better AuthのAPIルートが正しく設定されているか確認してください。`src/routes/api.auth.$.ts` が存在し、正しく設定されている必要があります。

## ライセンス

MIT
