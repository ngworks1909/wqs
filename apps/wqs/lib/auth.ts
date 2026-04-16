import prisma from '@repo/db/client'
import { loginUserSchema } from '@/zod/validateUser';
import bcrypt from 'bcryptjs';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { JWTPayload, SignJWT, importJWK } from 'jose';
import { Role } from '@prisma/client';

const generateJWT = async (payload: JWTPayload): Promise<string> => {
  const secret = process.env.JWT_SECRET ?? 'secret';

  const jwk = await importJWK(
    { k: secret, alg: 'HS256', kty: 'oct' },
    'HS256'
  );

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('365d')
    .sign(jwk);
};

export const NEXT_AUTH_CONFIG: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const parsed = loginUserSchema.safeParse(credentials);

        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            userId: true,
            username: true,
            email: true,
            password: true,
            role: true
          }
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        const jwt = await generateJWT({
          id: user.userId,
        });

        return {
          id: user.userId,
          name: user.username,
          email: user.email,
          role: user.role,
          token: jwt
        };
      }
    })
  ],

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      if (user) {
        token.uid = user.id;
        token.jwtToken = user.token;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid;
        session.user.role = token.role as Role;
      }
      return session;
    }
  },

  pages: {
    signIn: '/login'
  }
};