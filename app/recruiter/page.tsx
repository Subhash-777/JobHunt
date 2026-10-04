import { Metadata } from 'next'
import RecruiterClient from './RecruiterClient'

export const metadata: Metadata = {
  title: 'Recruiter Panel | JobHunt India',
  description: 'Post jobs and connect with top engineering talent across Indian colleges. Recruiter verification portal.',
  openGraph: {
    title: 'Recruiter Panel | JobHunt India',
    description: 'Find verified candidates from India\'s top colleges',
    type: 'website'
  }
}

export default function RecruiterPage() {
  return <RecruiterClient />
}
