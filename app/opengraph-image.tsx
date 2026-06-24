import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Noviq Finance — A clareza da planilha, a praticidade de um app'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#008CFF',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 64,
            fontWeight: 700,
            textAlign: 'center',
            lineHeight: 1.1,
            marginBottom: 32,
          }}
        >
          Noviq Finance
        </div>
        <div
          style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: 32,
            textAlign: 'center',
            lineHeight: 1.3,
            maxWidth: 900,
          }}
        >
          A clareza da planilha. A praticidade de um app.
        </div>
        <div
          style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: 22,
            textAlign: 'center',
            marginTop: 40,
          }}
        >
          Organize sua vida financeira com o método que funciona de verdade.
        </div>
      </div>
    ),
    { ...size }
  )
}
