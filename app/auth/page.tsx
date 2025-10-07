'use client'

import { useEffect, useState } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../../lib/supabaseClient'

export default function AuthPage() {
  const [email, setEmail] = useState<string | null>(null)
  const [name, setName] = useState<string>('')

  // Checa login e mantém sincronizado
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

  async function saveName() {
    if (!email || !name) return
    const { data, error } = await supabase
      .from('users')
      .update({ name })
      .eq('email', email)

    if (error) alert('Erro ao salvar nome 😢')
    else alert('Nome salvo com sucesso! 🎉')
  }

  async function signOut() {
    await supabase.auth.signOut()
    location.reload()
  }

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

          <p style={{ marginTop: 24 }}>Seu nome (opcional):</p>
          <input
            placeholder="Ex.: Liana"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ padding: 8, width: '100%', marginBottom: 8 }}
          />
          <button onClick={saveName}>Salvar nome</button>

          <div style={{ marginTop: 24 }}>
            <button onClick={signOut}>Sair</button>
          </div>
        </section>
      )}
    </main>
  )
}
