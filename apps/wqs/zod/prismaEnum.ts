import z from "zod"

export const prismaEnumToZod = <
  T extends Record<string, string>
>(
  prismaEnum: T,
  message = 'Invalid enum value'
) => {
  const values = Object.values(prismaEnum) as [
    T[keyof T],
    ...T[keyof T][]
  ]

  return z.enum(values, { message })
}