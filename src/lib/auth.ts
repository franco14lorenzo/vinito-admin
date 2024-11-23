import { QueryData } from '@supabase/supabase-js'

import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

import { createClient } from '@/lib/supabase/server'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
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

      return true
    },
    async authorized({ auth }) {
      return !!auth?.user
    }
  }
})

async function getAdminsByEmail(email: string) {
  const supabase = await createClient()
  const adminByEmailQuery = supabase
    .from('admin')
    .select('email')
    .eq('email', email)
    .single()

  type Admin = QueryData<typeof adminByEmailQuery>

  const { data, error } = await adminByEmailQuery

  return { data: data as Admin, error }
}
