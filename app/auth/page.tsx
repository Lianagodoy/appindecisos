'use client'

import { useEffect, useState } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { supabase } from '../../lib/supabaseClient'
import Link from 'next/link'

export default function AuthPage() {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState<string | null>(null)
  const [name, setName] = useState<string>('')

  // Checa usuário logado
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

    // Listener para login/logout
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

  // Função para salvar o nome
  async function salvarNome() {
    if (!email) return alert('Você precisa estar logada para salvar o nome.')
    const { error } = await supabase
      .from('users')
      .update({ name })
      .eq('email', email)

    if (error) {
      console.error(error)
      alert('Erro ao salvar o nome 😞')
    } else {
      alert('Nome salvo com sucesso! 🎉')
    }
  }

  // Logout
  async function signOut() {
    await supabase.auth.signOut()
    setEmail(null)
    setName('')
  }

  if (loading) return <p>Carregando...</p>

  return (
    <main style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h2>Autenticação</h2>

      {email ? (
        <>
          <p>
            Você está logada. <br />
            <strong>E-mail:</strong> {email}
          </p>

          <div style={{ marginTop: 20 }}>
            <label>Seu nome (opcional):</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                display: 'block',
                marginTop: 6,
                padding: 8,
                width: '100%',
                maxWidth: 300,
              }}
            />
            <button
              onClick={salvarNome}
              style={{
                marginTop: 10,
                padding: '8px 16px',
                backgroundColor: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: 4,
              }}
            >
              Salvar nome
            </button>
          </div>

          <p style={{ marginTop: 20 }}>
            <Link href="/">← Voltar para a Home</Link>
          </p>

          <button
            onClick={signOut}
            style={{
              marginTop: 10,
              background: 'transparent',
              border: 'none',
              color: 'red',
              cursor: 'pointer',
            }}
          >
            Sair
          </button>
        </>
      ) : (
        <Auth supabaseClient={supabase} appearance={{ theme: 'default' }} />
      )}
    </main>
  )
}
