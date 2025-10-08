'use client'

import { useEffect, useState } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../../lib/supabaseClient'

export default function AuthPage() {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState<string | null>(null)
  const [name, setName] = useState<string>('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let mounted = true

    ;(async () => {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!mounted) return

      if (user?.email) {
        setEmail(user.email)
        const { data } = await supabase
          .from('users')
          .select('name')
          .eq('email', user.email)
          .single()

        if (data?.name) setName(data.name)
      }

      setLoading(false)
    })()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      window.location.reload()
    })

    return () => {
      subscription.unsubscribe()
      mounted = false
    }
  }, [])

  async function salvarNome() {
    if (!email) return alert('Você precisa estar logada para salvar o nome.')

    const { error } = await supabase.from('users').update({ name }).eq('email', email)

    if (error) {
      console.error(error)
      alert('Erro ao salvar o nome 😢')
    } else {
      setSaved(true)
      alert('Nome salvo com sucesso! 🎉')
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setEmail(null)
  }

  if (loading) return <p>Carregando...</p>

  return (
    <main style={{ padding: 20, maxWidth: 480, margin: 'auto', fontFamily: 'sans-serif' }}>
      <h2>Autenticação</h2>

      {email ? (
        <>
          <p>
            Você está logada. <br />
            <strong>E-mail:</strong> {email}
          </p>

          <div>
            <p>Seu nome (opcional):</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Liana"
              style={{
                padding: 10,
                width: '100%',
                maxWidth: 360,
                border: '1px solid #ccc',
                borderRadius: 6,
              }}
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

          <a href="/" style={{ display: 'block', marginTop: 16 }}>
            ← Voltar para a Home
          </a>

          <button
            onClick={signOut}
            style={{
              marginTop: 10,
              padding: '8px 14px',
              background: '#555',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            Sair
          </button>
        </>
      ) : (
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
      )}
    </main>
  )
}
