import { Role } from "@prisma/client";

export type AuthType = "Login" | "Signup"
export interface IUserState {
  username: string;
  email: string;
  password: string;
}

export type SetStateType =
  | Partial<IUserState>
  | ((state: IUserState) => Partial<IUserState>);

export type AuthName = "email" | "password" | "username"


export interface InputFieldProps{
  name: AuthName
  placeholder: string,
  type?: AuthType
}

export interface IPasswordState {
  showPassword: boolean;
}

export interface IAuthLoadingState {
    loading: boolean;
}

export interface ErrorState {
  email: string | null;
  password: string | null;
  username: string | null;
}


export interface AuthLoadingState {
    loading: boolean
}

export interface SignupSuccessResponse{
    message: string
}
export interface SignupFailureResponse{
    error: string
}

export type SignupResponse = SignupSuccessResponse | SignupFailureResponse


export interface BaseUser{
  username: string;
  email: string
}

export interface IUserState extends BaseUser{
  password: string;
}

export interface Technician extends BaseUser{
  userId: string,
  createdAt: Date,
  _count: {
    testStories: number
  }
}