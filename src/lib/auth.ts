import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Kakao from "next-auth/providers/kakao"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: prisma ? PrismaAdapter(prisma) : undefined,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    Kakao({
      clientId: process.env.KAKAO_CLIENT_ID || "",
      clientSecret: process.env.KAKAO_CLIENT_SECRET || "",
    }),
    Credentials({
      name: "이메일",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email as string
        const password = credentials.password as string

        // 테스트 계정 (DB 미연결 시에도 동작)
        if ((email === 'test' || email === 'test@gmail.com') && password === '123456') {
          return {
            id: 'test-user-001',
            name: '테스트 유저',
            email: 'test@gmail.com',
            role: 'USER',
          }
        }
        if ((email === 'admin' || email === 'admin@gmail.com') && password === '123456') {
          return {
            id: 'test-admin-001',
            name: '관리자',
            email: 'admin@gmail.com',
            role: 'ADMIN',
          }
        }

        // DB 연결 시 실제 유저 조회
        if (!prisma) return null

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user?.password) return null

        const isValid = await bcrypt.compare(password, user.password)
        return isValid ? user : null
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role || "USER"
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as { role?: string }).role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})
