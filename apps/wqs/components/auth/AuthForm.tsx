"use client"
import { FieldGroup } from '../ui/field'
import { AuthType } from '@/types/auth'
import InputField from './InputField'
import AuthButton from './AuthButton'

export default function AuthForm({type}: {type: AuthType}) {
  return (
    <form>
      <FieldGroup>
        <div className='flex flex-col gap-3'>
          {type === "Signup" && <InputField name='username' placeholder='Enter username' />}
        <InputField name='email' placeholder='Enter email'/>
        <InputField name='password' placeholder='Enter password' type={type} />
        </div>
        <AuthButton type={type}/>
      </FieldGroup>
    </form>
  )
}
