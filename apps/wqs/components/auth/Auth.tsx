import { AuthType } from "@/types/auth"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  FieldDescription,
} from "@/components/ui/field"
import Link from 'next/link'
import AuthForm from './AuthForm'

export default function Auth({type}: {type: AuthType}) {
  return (
    <div className='flex flex-col gap-6'>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
              {type === "Login" ? "Welcome back" : "Join us today"}
            </CardTitle>
            <CardDescription>
              {type === "Login"
                ? "Sign in to continue to your account."
                : "Create your account and get started in seconds."}
            </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm type={type} />
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <Link href="/">Terms of Service</Link>{" "}
        and <Link href="/">Privacy Policy</Link>.
      </FieldDescription>
    </div>
  )
}
