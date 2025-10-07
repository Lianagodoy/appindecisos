'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState<string | null>(null)
  const [name, setName] = useState<string>('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      if (!mounted) return

      if (user?.email) {
        setEmail(user.email)

        // busca nome na tabela users
        const { data } = await supabase
          .from('users')
          .select('name')
          .eq('email', user.email)
          .single()

        if (data?.name) setName(data.name)
      }

      setLoading(false)
    })()

    const { data: listener } = supabase.auth.onAuthStateChange(async () => {
      // simples “refresh” de estado quando loga/desloga
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      setEmail(user?.email ?? null)

      if (user?.email) {
        const { data } = await supabase
          .from('users')
          .select('name')
          .eq('email', user.email)
          .single()
        setName(data?.name ?? '')
      } else {
        setName('')
      }
    })

    return () => {
      listener.subscription.unsubscribe()
      mounted = false
    }
  }, [])

  if (loading) {
    return <main style={{ padding: 24 }}>Carregando…</main>
  }

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 24, textAlign: 'center' }}>
      <h1>🌼 App Indecisos 🌼</h1>

      {email ? (
        <>
          <p style={{ marginTop: 8 }}>
            Bem-vinda, <strong>{name || 'visitante'}</strong>!
          </p>
          <div style={{ marginTop: 20 }}>
            <Link href="/auth">
              <button style={{ padding: '10px 18px' }}>
                Ir para minha conta (salvar/editar nome)
              </button>
            </Link>
          </div>
          <div style={{ marginTop: 12, opacity: 0.7 }}>
            <small>E-mail: {email}</small>
          </div>
        </>
      ) : (
        <>
          <p style={{ marginTop: 8 }}>Este é o começo do seu app 😉</p>
          <div style={{ marginTop: 20 }}>
            <Link href="/auth">
              <button style={{ padding: '10px 18px' }}>Entrar / Cadastrar</button>
            </Link>
          </div>
        </>
      )}
    </main>
  )
}
