import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Component {...pageProps} />
      </main>
      <Footer />
    </div>
  )
}

