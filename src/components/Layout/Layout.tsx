import { ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { NetworkSwitcher } from '@/components/Web3/NetworkSwitcher'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <NetworkSwitcher />
    </div>
  )
}

