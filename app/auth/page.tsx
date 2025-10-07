'use client'

import { useEffect, useState } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../../lib/supabaseClient'

export default function AuthPage() {
  const [email, setEmail] = useState<string | null>(null)

  // Quando logar, pega o usuário e salva o e-mail na tabela users (se não existir)
  useEffect(() => {
    let mounted = true

    ;(async () => {
      const { data } = await supabase.auth.getUser()
      if (!mounted) return
      setEmail(data.user?.email ?? null)
    })()

    const sub = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user
      setEmail(user?.email ?? null)

      if (user?.email) {
        // upsert (insere se não existir; se existir, mantém)
        await supabase.from('users').upsert(
          { id: user.id, email: user.email },
          { onConflict: 'id' }
        )
      }
    })

    return () => {
      mounted = false
      sub.data.subscription.unsubscribe()
    }
  }, [])

  return (
    <main style={{ maxWidth: 420, margin: '40px auto', padding: 24 }}>
      <h1>Autenticação</h1>

      {!email && (
        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{ theme: ThemeSupa }}
          localization={{
            variables: {
              sign_in: { email_label: 'E-mail', password_label: 'Senha' },
              sign_up: { email_label: 'E-mail', password_label: 'Senha' }
            }
          }}
        />
      )}

      {email && (
        <section style={{ marginTop: 24 }}>
          <p>Você está logada.</p>
          <p><strong>E-mail:</strong> {email}</p>
          <a href="/">← Voltar para a Home</a>
          <div style={{ marginTop: 12 }}>
            <button
              onClick={async () => { await supabase.auth.signOut(); location.reload() }}
            >
              Sair
            </button>
          </div>
        </section>
      )}
    </main>
  )
}
