import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSession } from "@/lib/auth-client";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const { data: session } = useSession();
  const navigate = useNavigate();

  if (session) navigate({ to: "/dashboard" });

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900'>
      <section className='relative py-20 px-6 text-center overflow-hidden'>
        <div className='relative max-w-5xl mx-auto'>
          <div className='flex items-center justify-center gap-6 mb-6'>
            <h1 className='text-6xl md:text-7xl font-black text-white [letter-spacing:-0.08em]'>
              <span className='text-gray-300'>KNOWLEDGE</span>{" "}
              <span className='bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent'>
                APP
              </span>
            </h1>
          </div>
          <div className='flex flex-col items-center gap-4'>
            <div className='flex gap-4'>
              <Link
                to='/signin'
                className='px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-500/50'
              >
                ログイン
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
