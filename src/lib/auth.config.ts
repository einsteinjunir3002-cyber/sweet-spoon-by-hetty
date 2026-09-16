import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
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
  providers: [], // Added in auth.ts
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.mustChangePassword = (user as any).mustChangePassword
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
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnAdmin = nextUrl.pathname.startsWith('/admin')
      
      if (isOnAdmin) {
        if (!isLoggedIn) return false // Redirects to login
        
        const role = (auth.user as any).role
        if (role !== 'OWNER' && role !== 'ADMIN') {
           return false // Redirects to login if not authorized
        }
        return true // Allowed
      }
      
      return true // Allow all other routes
    }
  },
} satisfies NextAuthConfig
