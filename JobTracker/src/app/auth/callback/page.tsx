"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleAuth = async () => {
      const code = searchParams.get('code');
      const next = searchParams.get('next') ?? '/dashboard';
      const supabase = createClient();

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          router.push(next);
          return;
        }
      }

      // Check for implicit flow hash fragment (PKCE fallback/email scanners)
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        // Supabase client automatically handles the hash fragment and establishes session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.push(next);
          return;
        }
      }

      // If we get here, neither PKCE nor implicit flow worked.
      const errorParam = searchParams.get('error') || searchParams.get('error_description');
      if (errorParam) {
        router.push(`/login?error=${encodeURIComponent(errorParam)}`);
        return;
      }

      // Fallback error
      setErrorMsg('Could not verify your registration link. It may have expired or already been used. Please try logging in.');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    };

    handleAuth();
  }, [router, searchParams]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}>
      {errorMsg ? (
        <div style={{ padding: '20px', textAlign: 'center', maxWidth: '400px', backgroundColor: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: '8px', color: 'var(--danger-text)' }}>
          <p>{errorMsg}</p>
          <p style={{ fontSize: '12px', marginTop: '10px' }}>Redirecting to login...</p>
        </div>
      ) : (
        <>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 500 }}>Verifying your account...</h2>
        </>
      )}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg)' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)', marginBottom: '16px' }} />
        <h2 style={{ fontSize: '18px', fontWeight: 500 }}>Verifying your account...</h2>
        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    }>
      <AuthCallbackInner />
    </Suspense>
  );
}
