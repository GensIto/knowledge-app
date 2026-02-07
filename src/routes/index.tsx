import { createFileRoute, Link } from "@tanstack/react-router";
import { useSession } from "@/lib/auth-client";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const { data: session } = useSession();

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900'>
      <section className='relative py-20 px-6 text-center overflow-hidden'>
        <div className='relative max-w-5xl mx-auto'>
          <div className='flex items-center justify-center gap-6 mb-6'>
            <img
              src='/tanstack-circle-logo.png'
              alt='TanStack Logo'
              className='w-24 h-24 md:w-32 md:h-32'
            />
            <h1 className='text-6xl md:text-7xl font-black text-white [letter-spacing:-0.08em]'>
              <span className='text-gray-300'>TANSTACK</span>{" "}
              <span className='bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent'>
                START
              </span>
            </h1>
          </div>
          <div className='flex flex-col items-center gap-4'>
            <div className='flex gap-4'>
              {session ? (
                <Link
                  to='/dashboard'
                  className='px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-500/50'
                >
                  ダッシュボード
                </Link>
              ) : (
                <>
                  <Link
                    to='/signin'
                    className='px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-500/50'
                  >
                    ログイン
                  </Link>
                  <Link
                    to='/signup'
                    className='px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors'
                  >
                    サインアップ
                  </Link>
                </>
              )}
            </div>
            <p className='text-gray-400 text-sm mt-2'>
              {session ? (
                <>ようこそ、{session.user.name || session.user.email}さん！</>
              ) : (
                <>
                  Begin your TanStack Start journey by editing{" "}
                  <code className='px-2 py-1 bg-slate-700 rounded text-cyan-400'>
                    /src/routes/index.tsx
                  </code>
                </>
              )}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
