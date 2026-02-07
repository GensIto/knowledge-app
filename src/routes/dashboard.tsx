import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSession, signOut } from "@/lib/auth-client";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const { data: session, isPending } = useSession();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate({ to: "/signin" });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-800 to-black">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-800 to-black p-4"
        style={{
          backgroundImage:
            "radial-gradient(50% 50% at 20% 60%, #23272a 0%, #18181b 50%, #000000 100%)",
        }}
      >
        <div className="w-full max-w-md p-8 rounded-xl backdrop-blur-md bg-black/50 shadow-xl border border-zinc-800 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            ログインが必要です
          </h1>
          <p className="text-zinc-400 mb-6">
            このページを表示するには、ログインしてください。
          </p>
          <button
            onClick={() => navigate({ to: "/signin" })}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            ログイン
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-zinc-800 to-black p-4"
      style={{
        backgroundImage:
          "radial-gradient(50% 50% at 20% 60%, #23272a 0%, #18181b 50%, #000000 100%)",
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 p-6 rounded-xl backdrop-blur-md bg-black/50 shadow-xl border border-zinc-800">
          <div>
            <h1 className="text-3xl font-bold text-white">ダッシュボード</h1>
            <p className="text-zinc-400 mt-2">
              ようこそ、{session.user.name || session.user.email}さん！
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            ログアウト
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl backdrop-blur-md bg-black/50 shadow-xl border border-zinc-800">
            <h2 className="text-xl font-bold text-white mb-4">
              ユーザー情報
            </h2>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-zinc-400">名前</dt>
                <dd className="text-white">{session.user.name || "未設定"}</dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-400">メールアドレス</dt>
                <dd className="text-white">{session.user.email}</dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-400">ユーザーID</dt>
                <dd className="text-white text-xs font-mono">{session.user.id}</dd>
              </div>
            </dl>
          </div>

          <div className="p-6 rounded-xl backdrop-blur-md bg-black/50 shadow-xl border border-zinc-800">
            <h2 className="text-xl font-bold text-white mb-4">
              セッション情報
            </h2>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-zinc-400">セッションID</dt>
                <dd className="text-white text-xs font-mono">{session.session.id}</dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-400">有効期限</dt>
                <dd className="text-white">
                  {new Date(session.session.expiresAt).toLocaleString("ja-JP")}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-8 p-6 rounded-xl backdrop-blur-md bg-black/50 shadow-xl border border-zinc-800">
          <h2 className="text-xl font-bold text-white mb-4">
            次のステップ
          </h2>
          <ul className="space-y-2 text-zinc-300">
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              プロフィール設定を完了する
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              パスワードを変更する
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              二要素認証を設定する（オプション）
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              アプリケーションの機能を探索する
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
