import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Versao 0 App',
  description: 'Versao 0 do projeto',
 
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
