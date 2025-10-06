'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center'
    }}>
      <h1>🌟 App Indecisos 🌟</h1>
      <p>Bem-vinda, Liana! Este é o começo do seu app 😉</p>
      <Link href="/auth">
        <button style={{
          marginTop: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          borderRadius: '6px',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          cursor: 'pointer'
        }}>
          Entrar / Cadastrar
        </button>
      </Link>
    </main>
  )
}
