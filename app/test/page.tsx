'use client'

import { useEffect, useState } from 'react'
// caminho relativo: a pasta lib fica no mesmo nível da pasta app
import { supabase } from '../../lib/supabaseClient'

export default function TestSupabasePage() {
  const [status, setStatus] = useState('Testando conexão...')
  const [details, setDetails] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const { data, error } = await supabase.from('users').select('id').limit(1)

        if (error) {
          setStatus('Conectado, mas sem permissão (RLS) — OK por enquanto.')
          setDetails(error.message)
        } else {
          setStatus('Conectado e consulta OK ✅')
          setDetails(JSON.stringify(data))
        }
      } catch (e: any) {
        setStatus('Falha ao conectar ❌')
        setDetails(e?.message ?? String(e))
      }
    })()
  }, [])

  const maskedUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/(.{12}).+(.{8})/, '$1…$2') ?? ''

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Teste Supabase</h1>
      <p><b>URL:</b> {maskedUrl}</p>
      <p><b>Status:</b> {status}</p>
      {details && (
        <>
          <p><b>Detalhes:</b></p>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{details}</pre>
        </>
      )}
    </div>
  )
}
