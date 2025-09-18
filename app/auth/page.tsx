'use client'

import { useEffect, useState } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { supabase } from '../../lib/supabaseClient'

export default function AuthPage() {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState<string | null>(null)
  const [name, setName] = useState('')

  // 1) Checa usuário logado ao montar
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      if (!mounted) return
      setEmail(data.user?.email ?? null)
      setLoading(false)
    })()

    // 2) Sincroniza com a tabela users quando o estado de auth muda
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentEmail = session?.user?.email ?? null
        setEmail(currentEmail)

        if (currentEmail) {
          await supabase
            .from('users')
            .upsert({ email: currentEmail, name: name || null }, { onConflict: 'email' })
        }
      }
    )

    return () => {
      mounted = false
      authListener.subscription.unsubscribe()
    }
  }, [name])

  const signOut = async () => {
    await supabase.auth.signOut()
    setEmail(null)
  }

  if (loading) return <div style={{ padding: 24 }}>Carregando…</div>

  // Logada: mostra e-mail e permite salvar/atualizar nome
  if (email) {
    const saveName = async () => {
      await supabase.from('users').upsert({ email, name }, { onConflict: 'email' })
      alert('Nome salvo!')
    }

    return (
      <div style={{ maxWidth: 420, margin: '40px auto', padding: 16 }}>
        <h2>Você está logada</h2>
        <p><b>E-mail:</b> {email}</p>

        <div style={{ marginTop: 16 }}>
          <label>Seu nome (opcional):</label>
          <input
            style={{ width: '100%', padding: 8, marginTop: 8 }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Liana"
          />
          <button onClick={saveName} style={{ marginTop: 12 }}>Salvar nome</button>
        </div>

        <button onClick={signOut} style={{ marginTop: 24 }}>Sair</button>
      </div>
    )
  }

  // Não logada: mostra o formulário padrão de e-mail/senha
  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 16 }}>
      <h1>Entrar / Criar conta</h1>
      <Auth
        supabaseClient={supabase}
        providers={[]}
        redirectTo="https://appindecisos.vercel.app/auth"
      />
    </div>
  )
}