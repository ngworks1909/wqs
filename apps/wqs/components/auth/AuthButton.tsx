"use client";
import { AuthType, SignupSuccessResponse } from "@/types/auth";
import { Field, FieldDescription } from "../ui/field";
import { Button } from "../ui/button";
import Link from "next/link";
import { useMemo } from "react";
import {
  useUserState,
  useErrorState,
  useAuthLoadingState,
} from "@/atoms/AuthState";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { signup } from "@/actions/signup";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { isAxiosError } from "axios";

export default function AuthButton({ type }: { type: AuthType }) {
  const { email, password, username, setState } = useUserState();
  const {
    email: emailError,
    password: passwordError,
    username: usernameError,
    clearErrors
  } = useErrorState();
  const { loading, setLoading } = useAuthLoadingState();
  const router = useRouter();
  const handleSubmit = async () => {
      try {
          setLoading(true);
          if(type === "Signup"){
              const response: SignupSuccessResponse = await signup(username, email, password) as SignupSuccessResponse
              if(response.message){
                  toast.success(response.message)
              }
              setState({password: "", username: ""})
              router.replace("/login")
          }else{
              const response = await signIn('credentials', { email, password, callbackUrl: "/", redirect: false });
              if(response?.ok){
                toast.success("Logged in successfully");
                setState({password: "", email: "", username: ""})
                router.replace("/");
              }
              else{
                toast.error(response?.error ?? "Invalid credentials");
              }
          }
      } catch (error) {
          if(isAxiosError(error) && error.response && error.response.data){
              toast.error(error.response.data.error ?? "Something went wrong")
              return
          }
          toast.error("Something went wrong")
      }
      finally{
          setLoading(false)
      }
    };

  const data = useMemo(() => {
    if (type === "Login")
      return {
        description: "Don't have an account?",
        link: "/signup",
        linkText: "Sign up",
      };
    return {
      description: "Already have an account?",
      link: "/login",
      linkText: "Login",
    };
  }, [type]);

  // Check if there are any validation errors
  const hasErrors =
    emailError !== null || passwordError !== null || usernameError !== null;

  // Check if all required fields are filled
  const isEmailEmpty = !email || email.trim() === "";
  const isPasswordEmpty = !password || password.trim() === "";
  const isUsernameEmpty =
    type === "Signup" && (!username || username.trim() === "");

  const isDisabled =
    hasErrors || isEmailEmpty || isPasswordEmpty || isUsernameEmpty || loading;

  return (
    <Field>
      <Button
        type="submit"
        disabled={isDisabled}
        onClick={async(e) => {
          e.preventDefault();
          await handleSubmit()
        }}
        className="flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading
          ? type === "Login"
            ? "Logging in..."
            : "Signing up..."
          : type}
      </Button>
      <FieldDescription className="text-center">
        {data.description} <Link href={`${data.link}`} onClick={() => {
          clearErrors()
          setState({email: "", password: "", username: ""})
        }} >{data.linkText}</Link>
      </FieldDescription>
    </Field>
  );
}
