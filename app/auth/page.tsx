'use client'

import { useEffect, useState } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { supabase } from '../../lib/supabaseClient'

export default function AuthPage() {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState<string | null>(null)
  const [name, setName] = useState<string>('')

  useEffect(() => {
    let mounted = true

    ;(async () => {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      if (!mounted) return

      setEmail(user?.email ?? null)

      if (user?.email) {
        const { data } = await supabase
          .from('users')
          .select('name')
          .eq('email', user.email)
          .single()
        setName(data?.name ?? '')
      }

      setLoading(false)
    })()

    const { data: listener } = supabase.auth.onAuthStateChange(async () => {
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

  async function salvarNome() {
    if (!email) return alert('Você precisa estar logada para salvar o nome.')
    const { error } = await supabase.from('users').update({ name }).eq('email', email)
    if (error) {
      console.error(error)
      alert('Erro ao salvar o nome 😞')
    } else {
      alert('Nome salvo com sucesso! 🎉')
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setEmail(null)
    setName('')
  }

  if (loading) return <p style={{ padding: 24 }}>Carregando...</p>

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>Autenticação</h2>

      {email ? (
        <>
          <p style={{ lineHeight: 1.6 }}>
            Você está logada. <br />
            <strong>E-mail:</strong> {email}
          </p>

          <div style={{ marginTop: 20 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>Seu nome (opcional):</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ padding: 10, width: '100%', maxWidth: 360, border: '1px solid #ddd', borderRadius: 6 }}
            />
            <button
              onClick={salvarNome}
              style={{
                marginTop: 10,
                padding: '10px 16px',
                background: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Salvar nome
            </button>
          </div>

          <a
            href="/"
            style={{
              display: 'inline-block',
              marginTop: 24,
              padding: '12px 18px',
              background: '#111',
              color: '#fff',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            ← Voltar para a Home
          </a>

          <div>
            <button
              onClick={signOut}
              style={{
                marginTop: 16,
                background: 'transparent',
                border: 'none',
                color: '#d00',
                cursor: 'pointer',
              }}
            >
              Sair
            </button>
          </div>
        </>
      ) : (
        <Auth supabaseClient={supabase} appearance={{ theme: 'default' }} />
      )}
    </main>
  )
}
