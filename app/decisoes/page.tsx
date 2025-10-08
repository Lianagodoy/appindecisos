'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'

export default function DecisoesPage() {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    ;(async () => {
      const { data } = await supabase.auth.getUser()
      if (!mounted) return
      const user = data.user

      // se não estiver logada, manda para /auth
      if (!user) {
        window.location.href = '/auth'
        return
      }

      setEmail(user.email ?? null)
      setLoading(false)
    })()

    // se o usuário sair, volta para /auth
    const listener = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) window.location.href = '/auth'
    })

    return () => {
      listener.data.subscription.unsubscribe()
      mounted = false
    }
  }, [])

  if (loading) return <main style={{ padding: 24 }}>Carregando…</main>

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 24, textAlign: 'center' }}>
      <h1>🌼 Minhas decisões</h1>

      <p style={{ marginTop: 8 }}>
        Você está logada como <strong>{email}</strong>
      </p>

      {/* Conteúdo provisório */}
      <div style={{ marginTop: 20, padding: 16, border: '1px solid #ddd', borderRadius: 6 }}>
        <p>(Aqui vamos colocar as decisões mais tarde)</p>
      </div>

      <div style={{ marginTop: 24 }}>
        <Link href="/">
          <button style={{ padding: '10px 18px', cursor: 'pointer' }}>← Voltar para a Home</button>
        </Link>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={signOut} style={{ padding: '8px 14px', cursor: 'pointer' }}>
          Sair
        </button>
      </div>
    </main>
  )
}
