import { QueryData } from '@supabase/supabase-js'

import NextAuth from 'next-auth'
import type { Provider } from 'next-auth/providers'
import Google from 'next-auth/providers/google'

import { createClient } from '@/lib/supabase/server'

const providers: Provider[] = [Google]

export const providersMap = providers.map((provider) => {
  if (typeof provider === 'function') {
    const providerData = provider()
    return { id: providerData.id, name: providerData.name }
  } else {
    return { id: provider.id, name: provider.name }
  }
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,
  callbacks: {
    async signIn({ user }) {
      const email = user?.email

      if (!email) {
        return false
      }

      const { data, error } = await getAdminsByEmail(email)

      if (error) {
        throw error
      }

      if (!data) {
        return false
      }

      console.log('Admin signed in:', data)
      user.id = data.id.toString()

      return true
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string
      }
      return session
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id
      }
      return token
    },
    async authorized({ auth }) {
      return !!auth?.user
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  }
})

async function getAdminsByEmail(email: string) {
  const supabase = await createClient()
  const adminByEmailQuery = supabase
    .from('admin')
    .select('id, email')
    .eq('email', email)
    .single()

  type Admin = QueryData<typeof adminByEmailQuery>

  const { data, error } = await adminByEmailQuery

  return { data: data as Admin, error }
}
