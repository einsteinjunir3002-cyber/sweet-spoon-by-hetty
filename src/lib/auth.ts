import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'sweet-spoon-secret-key-32-chars-minimum-debbie-2026',
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

        // 1. Built-in Owner Fallback Credentials (allows Hetty to log in anytime)
        const isOwnerUsername = [
          'bigdebbie',
          'hetty',
          'admin',
          'owner',
          'bigdebbie@sweetspoonbyhetty.com',
          'hetty@sweetspoonbyhetty.com',
        ].includes(identifier)

        const isOwnerPassword = [
          'debbie12345',
          'hetty123',
          'admin123',
          'sweetspoon2026',
        ].includes(password)

        if (isOwnerUsername && isOwnerPassword) {
          return {
            id: 'owner-hetty-admin-id',
            name: 'Hetty (Sweet Spoon Owner)',
            email: 'BigDebbie@sweetspoonbyhetty.com',
            role: 'OWNER',
            mustChangePassword: false,
          }
        }

        // 2. Database User Auth (if database is connected)
        if (process.env.DATABASE_URL) {
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
            console.warn('Database user auth fallback:', dbError)
          }
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
