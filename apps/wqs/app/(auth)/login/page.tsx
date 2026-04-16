"use server"

import Auth from '@/components/auth/Auth'

export default async function page() {
  return (
    <Auth type='Login'/>
  )
}