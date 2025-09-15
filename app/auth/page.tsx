'use client'

import { Auth } from '@supabase/auth-ui-react'
import { supabase } from '../../lib/supabaseClient'

export default function AuthPage() {
  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 16 }}>
      <h1>Entrar / Criar conta</h1>
      <Auth
        supabaseClient={supabase}
        providers={[]} // deixamos só e-mail/senha por enquanto
        redirectTo={typeof window !== 'undefined' ? window.location.origin : undefined}
      />
    </div>
  )
}
