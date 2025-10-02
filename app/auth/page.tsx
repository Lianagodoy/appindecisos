export default function Home() {
  return (
    <main style={{ maxWidth: 720, margin: '40px auto', padding: 24 }}>
      <h1>App Indecisos</h1>
      <p>Bem-vinda! Este é o começo do seu app 😉</p>

      <div style={{ marginTop: 24 }}>
        <a
          href="/auth"
          style={{
            display: 'inline-block',
            padding: '10px 14px',
            border: '1px solid #ccc',
            borderRadius: 6,
            textDecoration: 'none'
          }}
        >
          Entrar / Minha conta
        </a>
      </div>
    </main>
  )
}
