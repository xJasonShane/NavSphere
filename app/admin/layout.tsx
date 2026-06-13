import { AdminLayoutClient } from './AdminLayoutClient'
import { Toaster } from "@/components/ui/toaster"
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'NavSphere Admin',
  description: 'NavSphere Admin Dashboard',
  icons: {
    icon: '/assets/images/favicon.webp',
    shortcut: '/assets/images/favicon.webp',
    apple: '/assets/images/favicon.webp',
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 仅开发环境可用
  if (process.env.NODE_ENV !== 'development') {
    notFound()
  }

  return (
    <>
      <AdminLayoutClient
        user={{
          name: 'Local Dev',
          email: 'dev@localhost',
          image: null
        }}
      >
        {children}
      </AdminLayoutClient>
      <Toaster />
    </>
  )
}
