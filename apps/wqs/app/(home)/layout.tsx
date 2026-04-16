
import Sidebar from "@/components/sidebar/Sidebar"
import { NEXT_AUTH_CONFIG } from "@/lib/auth"
import { getServerSession, User } from "next-auth"

export default async function layout({ children }: { children: React.ReactNode }) {
  const session= await getServerSession(NEXT_AUTH_CONFIG)
  const user = session?.user as User
  return (
    <Sidebar user={user} >{children}</Sidebar>
  )
}
