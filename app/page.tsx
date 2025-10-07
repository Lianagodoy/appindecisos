'use client'

import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import Link from 'next/link'

export default function HomePage() {
  const [name, setName] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      const user = data.user
      if (user?.email) {
        setEmail(user.email)
        const { data: userData } = await supabase
          .from('users')
          .select('name')
          .eq('email', user.email)
          .single()
        setName(userData?.name ?? null)
      }
    }

    fetchUser()
  }, [])

  return (
    <main style={{ textAlign: 'center', padding: 40 }}>
      <h1>🌟 App Indecisos 🌟</h1>

      {name ? (
        <p style={{ marginTop: 16 }}>Bem-vinda de volta, <strong>{name}</strong>! 😄</p>
      ) : email ? (
        <p style={{ marginTop: 16 }}>Bem-vinda! 💫</p>
      ) : (
        <p style={{ marginTop: 16 }}>Bem-vinda ao seu app! 💫</p>
      )}

      <p style={{ marginTop: 8 }}>Este é o começo do seu app ✨</p>

      <Link href="/auth">
        <button style={{ marginTop: 24, padding: '10px 20px' }}>
          Entrar / Cadastrar
        </button>
      </Link>
    </main>
  )
}
