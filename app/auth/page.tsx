'use client'

import { useEffect, useState } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { supabase } from '../../lib/supabaseClient'

export default function AuthPage() {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  // carrega usuário e nome já salvo (se existir)
  async function loadProfile(currentEmail: string) {
    // garante que exista uma linha para esse email (não mexe no nome aqui)
    await supabase.from('users').upsert({ email: currentEmail }, { onConflict: 'email' })
    // busca o nome atual
    const { data, error } = await supabase
      .from('users')
      .select('name')
      .eq('email', currentEmail)
      .single()
    if (!error && data) setName(data.name ?? '')
  }

  useEffect(() => {
  let mounted = true

  async function bootstrap() {
    try {
      const { data, error } = await supabase.auth.getUser()
      if (error) {
        console.error('getUser error:', error)
      }
      if (!mounted) return

      const currentEmail = data?.user?.email ?? null
      setEmail(currentEmail)

      if (currentEmail) {
        // garante que existe uma linha e lê o nome salvo
        await supabase.from('users').upsert({ email: currentEmail }, { onConflict: 'email' })
        const { data: profile } = await supabase
          .from('users')
          .select('name')
          .eq('email', currentEmail)
          .single()
        setName(profile?.name ?? '')
      }
    } catch (e) {
      console.error('bootstrap failed:', e)
    } finally {
      // IMPORTANTÍSSIMO: sempre liberar o loading
      if (mounted) setLoading(false)
    }
  }

  bootstrap()

  const { data: authListener } = supabase.auth.onAuthStateChange(
    async (_event, session) => {
      const currentEmail = session?.user?.email ?? null
      setEmail(currentEmail)
      if (currentEmail) {
        await supabase.from('users').upsert({ email: currentEmail }, { onConflict: 'email' })
        const { data: profile } = await supabase
          .from('users')
          .select('name')
          .eq('email', currentEmail)
          .single()
        setName(profile?.name ?? '')
      } else {
        setName('')
      }
    }
  )

  return () => {
    mounted = false
    authListener.subscription.unsubscribe()
  }
}, [])
  
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentEmail = session?.user?.email ?? null
        setEmail(currentEmail)
        if (currentEmail) await loadProfile(currentEmail)
      }
    )

    return () => {
      mounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setEmail(null)
    setName('')
  }

const saveName = async () => {
  setMsg(null)
  if (!email) return

  // Atualiza a linha já existente do usuário (pela coluna email)
  const { error } = await supabase
    .from('users')
    .update({ name })
    .eq('email', email)

  if (error) {
    setMsg('Erro ao salvar: ' + error.message)
  } else {
    setMsg('Nome salvo com sucesso!')
  }
}
  if (loading) return <div style={{ padding: 24 }}>Carregando…</div>

  if (email) {
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
          {msg && <p style={{ marginTop: 8 }}>{msg}</p>}
        </div>

        <button onClick={signOut} style={{ marginTop: 24 }}>Sair</button>
      </div>
    )
  }

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
