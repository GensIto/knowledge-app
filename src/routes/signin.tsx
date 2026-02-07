import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { signIn } from "@/lib/auth-client";
import { signInSchema } from "@/shared/schema/signInSchema";

export const Route = createFileRoute("/signin")({
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const [generalError, setGeneralError] = useState("");

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: signInSchema,
    },
    onSubmit: async ({ value }) => {
      setGeneralError("");

      try {
        await signIn.email({
          email: value.email,
          password: value.password,
        });

        navigate({ to: "/" });
      } catch (error) {
        console.error("Sign in error:", error);

        if (error instanceof Error) {
          setGeneralError("メールアドレスまたはパスワードが正しくありません。");
        } else {
          setGeneralError("予期しないエラーが発生しました。");
        }
      }
    },
  });

  return (
    <div
      className='flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-800 to-black p-4'
      style={{
        backgroundImage:
          "radial-gradient(50% 50% at 20% 60%, #23272a 0%, #18181b 50%, #000000 100%)",
      }}
    >
      <div className='w-full max-w-md p-8 rounded-xl backdrop-blur-md bg-black/50 shadow-xl border border-zinc-800'>
        <h1 className='text-3xl font-bold text-white mb-6 text-center'>
          ログイン
        </h1>

        {generalError && (
          <div className='mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm'>
            {generalError}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className='space-y-4'
        >
          <form.Field name='email'>
            {(field) => (
              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium text-zinc-300 mb-2'
                >
                  メールアドレス
                </label>
                <input
                  type='email'
                  id='email'
                  name='email'
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className={`w-full px-4 py-3 rounded-lg bg-zinc-900/50 border ${
                    field.state.meta.errors.length > 0
                      ? "border-red-500"
                      : "border-zinc-700"
                  } text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder='example@email.com'
                  disabled={form.state.isSubmitting}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className='mt-1 text-sm text-red-400'>
                    {String(field.state.meta.errors[0])}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name='password'>
            {(field) => (
              <div>
                <label
                  htmlFor='password'
                  className='block text-sm font-medium text-zinc-300 mb-2'
                >
                  パスワード
                </label>
                <input
                  type='password'
                  id='password'
                  name='password'
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className={`w-full px-4 py-3 rounded-lg bg-zinc-900/50 border ${
                    field.state.meta.errors.length > 0
                      ? "border-red-500"
                      : "border-zinc-700"
                  } text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder='••••••••'
                  disabled={form.state.isSubmitting}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className='mt-1 text-sm text-red-400'>
                    {String(field.state.meta.errors[0])}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <button
            type='submit'
            disabled={form.state.isSubmitting}
            className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors'
          >
            {form.state.isSubmitting ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        <div className='mt-4 text-center text-sm text-zinc-400'>
          アカウントをお持ちでないですか？{" "}
          <Link
            to='/signup'
            className='text-blue-400 hover:text-blue-300 font-medium'
          >
            アカウントを作成
          </Link>
        </div>
      </div>
    </div>
  );
}
