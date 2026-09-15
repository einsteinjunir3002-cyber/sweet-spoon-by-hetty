import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  trustHost: true,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        identifier: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error('Please enter your email/username and password')
        }

        const identifier = (credentials.identifier as string).trim().toLowerCase()
        const password = credentials.password as string

        // Database User Auth via hashed password
        try {
          const user = await db.user.findFirst({
            where: {
              OR: [
                { email: identifier },
                { username: identifier },
              ],
              isActive: true,
            },
          })

          if (user) {
            const isPasswordValid = await bcrypt.compare(password, user.password)
            if (isPasswordValid) {
              return {
                id: user.id,
                email: user.email,
                name: user.name ?? user.username,
                role: user.role,
                mustChangePassword: user.mustChangePassword,
              }
            }
          }
        } catch (dbError) {
          console.error('Database user authentication error:', dbError)
        }

        throw new Error('Invalid email/username or password')
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: string }).role
        token.mustChangePassword = (user as { mustChangePassword: boolean }).mustChangePassword
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.mustChangePassword = token.mustChangePassword as boolean
      }
      return session
    },
  },
})
