import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const { data: session } = useSession();

  if (!session) return null;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate({ to: "/signin" });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <div
      className='min-h-screen bg-gradient-to-br from-zinc-800 to-black p-4'
      style={{
        backgroundImage:
          "radial-gradient(50% 50% at 20% 60%, #23272a 0%, #18181b 50%, #000000 100%)",
      }}
    >
      <div className='max-w-4xl mx-auto space-y-4'>
        <Card className='backdrop-blur-md bg-black/50 shadow-xl border border-zinc-800'>
          <CardHeader>
            <CardTitle className='text-2xl font-bold text-white'>
              ダッシュボード
            </CardTitle>
            <CardDescription>
              ようこそ、{session.user.name || session.user.email}さん！
            </CardDescription>
            <CardAction>
              <Button onClick={handleSignOut}>ログアウト</Button>
            </CardAction>
          </CardHeader>
          <CardContent></CardContent>
          <CardFooter></CardFooter>
        </Card>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Card className='backdrop-blur-md bg-black/50 shadow-xl border border-zinc-800'>
            <CardHeader>
              <CardTitle className='text-2xl font-bold text-white'>
                ユーザー情報
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className='space-y-2'>
                <div>
                  <dt className='text-sm text-zinc-400'>名前</dt>
                  <dd className='text-white'>
                    {session.user.name || "未設定"}
                  </dd>
                </div>
                <div>
                  <dt className='text-sm text-zinc-400'>メールアドレス</dt>
                  <dd className='text-white'>{session.user.email}</dd>
                </div>
                <div>
                  <dt className='text-sm text-zinc-400'>ユーザーID</dt>
                  <dd className='text-white text-xs font-mono'>
                    {session.user.id}
                  </dd>
                </div>
              </dl>
            </CardContent>
            <CardFooter></CardFooter>
          </Card>
          <Card className='backdrop-blur-md bg-black/50 shadow-xl border border-zinc-800'>
            <CardHeader>
              <CardTitle className='text-2xl font-bold text-white'>
                セッション情報
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className='space-y-2'>
                <div>
                  <dt className='text-sm text-zinc-400'>セッションID</dt>
                  <dd className='text-white'>{session.session.id}</dd>
                </div>
                <div>
                  <dt className='text-sm text-zinc-400'>有効期限</dt>
                  <dd className='text-white'>
                    {new Date(session.session.expiresAt).toLocaleString(
                      "ja-JP",
                    )}
                  </dd>
                </div>
                <div>
                  <dt className='text-sm text-zinc-400'>ユーザーID</dt>
                  <dd className='text-white text-xs font-mono'>
                    {session.user.id}
                  </dd>
                </div>
              </dl>
            </CardContent>
            <CardFooter></CardFooter>
          </Card>
        </div>
        <Card className='backdrop-blur-md bg-black/50 shadow-xl border border-zinc-800'>
          <CardHeader>
            <CardTitle className='text-2xl font-bold text-white'>
              次のステップ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className='space-y-2 text-zinc-300'>
              <li className='flex items-start'>
                <span className='text-blue-400 mr-2'>•</span>
                プロフィール設定を完了する
              </li>
              <li className='flex items-start'>
                <span className='text-blue-400 mr-2'>•</span>
                パスワードを変更する
              </li>
              <li className='flex items-start'>
                <span className='text-blue-400 mr-2'>•</span>
                二要素認証を設定する（オプション）
              </li>
              <li className='flex items-start'>
                <span className='text-blue-400 mr-2'>•</span>
                アプリケーションの機能を探索する
              </li>
            </ul>
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
      </div>
    </div>
  );
}
