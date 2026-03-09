import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authService } from '@/services/auth.service'

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) return null;

        try {
          const user = await authService.login(
            String(credentials.phone),
            String(credentials.password)
          )
          return {
            id: String(user.id),
            name: user.name,
            phone: user.phone,
            role: user.role,
          }
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!
        token.role = user.role
        token.phone = user.phone
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as 'ADMIN' | 'CUSTOMER'
        session.user.phone = token.phone as string
      }
      return session
    },
  },
})
