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

    // 2) Sincroniza com a tabela users quando o estado do auth mudar
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setEmail(session?.user?.email ?? null)
        setLoading(false)
      }
    )

    // cleanup
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  // 3) Função para salvar nome
  const saveName = async () => {
    if (!email) return
    await supabase.from('users').update({ name }).eq('email', email)
    alert('Nome salvo!')
  }

  // 4) Função para sair
  const signOut = async () => {
    await supabase.auth.signOut()
    setEmail(null)
  }

  if (loading) return <p>Carregando...</p>

  return (
    <div style={{ padding: 20 }}>
      {!email ? (
        <Auth supabaseClient={supabase} />
      ) : (
        <div>
          <p>Você está logada</p>
          <p>
            <strong>E-mail:</strong> {email}
          </p>

          <div>
            <label>
              Seu nome (opcional):
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Liana"
              />
            </label>
            <button onClick={saveName}>Salvar nome</button>
          </div>

          <button onClick={signOut}>Sair</button>
        </div>
      )}
    </div>
  )
}
