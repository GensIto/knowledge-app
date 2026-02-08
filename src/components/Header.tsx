import { Link, useNavigate } from "@tanstack/react-router";

import { signOut, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { data: session } = useSession();

  const navigate = useNavigate();
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate({ to: "/signin" });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <header className='p-4 flex items-center bg-gray-800 text-white shadow-lg justify-between'>
      <h1 className='ml-4 text-xl font-semibold'>
        <Link to='/'>KNOWLEDGE APP</Link>
      </h1>
      {session && <Button onClick={handleSignOut}>ログアウト</Button>}
    </header>
  );
}
