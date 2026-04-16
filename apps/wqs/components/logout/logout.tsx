
"use client"
import React from 'react'
import { Button } from '../ui/button'
import { signOut } from 'next-auth/react'

export default function Logout() {
  return (
    <Button variant={"default"} onClick={() => {signOut()}}>Logout</Button>
  )
}
