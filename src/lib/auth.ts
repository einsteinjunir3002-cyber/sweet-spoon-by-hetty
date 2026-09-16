import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { authConfig } from './auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  trustHost: true,
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

        const rawIdentifier = (credentials.identifier as string).trim()
        const lowerIdentifier = rawIdentifier.toLowerCase()
        const password = credentials.password as string

        // Database User Auth via hashed password (case-insensitive for username and email)
        try {
          const user = await db.user.findFirst({
            where: {
              OR: [
                { email: { equals: lowerIdentifier, mode: 'insensitive' } },
                { username: { equals: rawIdentifier, mode: 'insensitive' } },
                { username: { equals: lowerIdentifier, mode: 'insensitive' } },
                { email: { equals: rawIdentifier, mode: 'insensitive' } },
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
                name: user.name ?? user.username ?? 'User',
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
})
