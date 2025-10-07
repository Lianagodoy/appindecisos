'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Link from 'next/link'

export default function AuthPage() {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState<string | null>(null)
  const [name, setName] = useState('')

  // 1) Pega usuário logado e carrega o nome da tabela users
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      if (!mounted || !user?.email) {
        setLoading(false)
        return
      }
      setEmail(user.email)

      // busca nome salvo
      const { data } = await supabase
        .from('users')
        .select('name')
        .eq('email', user.email)
        .single()

      if (data?.name) setName(data.name)
      setLoading(false)
    })()

    // listener de auth (opcional)
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {})
    return () => {
      mounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  // 2) Salva/atualiza nome
  const saveName = async () => {
    if (!email) return alert('Você precisa estar logada.')
    try {
      // upsert por email (RLS já criada com check por email)
      const { error } = await supabase
        .from('users')
        .upsert({ email, name }, { onConflict: 'email' })

      if (error) throw error
      alert('Nome salvo com sucesso! 🎉')
    } catch (e: any) {
      alert('Erro ao salvar: ' + (e?.message ?? 'desconhecido'))
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/' // volta pra home
  }

  if (loading) {
    return <main style={{ padding: 24 }}>Carregando…</main>
  }

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <h2>Autenticação</h2>

      {email ? (
        <>
          <p><strong>Você está logada.</strong></p>
          <p><strong>E-mail:</strong> {email}</p>

          <p style={{ marginTop: 20 }}>Seu nome (opcional):</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Liana"
            style={{ padding: 8, width: '100%', maxWidth: 320 }}
          />
          <div style={{ marginTop: 12 }}>
            <button onClick={saveName} style={{ padding: '8px 16px' }}>
              Salvar nome
            </button>
          </div>

          <div style={{ marginTop: 24 }}>
            <Link href="/">← Voltar para a Home</Link>
          </div>

          <div style={{ marginTop: 16 }}>
            <button onClick={signOut} style={{ padding: '8px 16px' }}>
              Sair
            </button>
          </div>
        </>
      ) : (
        <>
          <p>Você não está logada.</p>
          <Link href="/">← Voltar para a Home</Link>
        </>
      )}
    </main>
  )
}
  
