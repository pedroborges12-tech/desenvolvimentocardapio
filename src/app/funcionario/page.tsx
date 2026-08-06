'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FuncionarioIndex() {
  const router = useRouter();

  useEffect(() => {
    fetch('/api/staff/check-auth')
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) router.replace('/funcionario/comanda');
        else router.replace('/funcionario/login');
      })
      .catch(() => router.replace('/funcionario/login'));
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-8 h-8 rounded-xl bg-amber-500 animate-bounce" />
    </div>
  );
}
