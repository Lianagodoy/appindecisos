'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function DecisoesPage() {
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    // pega sessão atual
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return
      setEmail(data.user?.email ?? null)
    })

    // escuta mudanças de autenticação
    const { data: listener } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (!mounted) return
      setEmail(session?.user?.email ?? null)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <h1>🌼 Minhas Decisões</h1>
      <p style={{ marginTop: 8, opacity: 0.8 }}>
        {email ? `Logada como: ${email}` : 'Carregando…'}
      </p>

      <div style={{ marginTop: 24 }}>
        <p>(Aqui vai o conteúdo da próxima tela. Por enquanto é só um esqueleto.)</p>
      </div>
    </main>
  )
}
