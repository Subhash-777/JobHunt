import { Metadata } from 'next'
import AdminSourceHealthClient from './AdminSourceHealthClient'

export const metadata: Metadata = {
  title: 'Source Health Dashboard | JobHunt Admin',
  description: 'Internal ingestion health monitor and AI usage tracker',
  robots: { index: false, follow: false }
}

export default function AdminSourceHealthPage() {
  return <AdminSourceHealthClient />
}
