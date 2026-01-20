import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
}

// Prevent crash if env vars are missing, allowing ErrorBoundary to catch the usage error
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : {
        auth: {
            getSession: () => Promise.reject(new Error('Missing Supabase Environment Variables')),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
            signInWithPassword: () => Promise.reject(new Error('Missing Supabase Environment Variables')),
            signUp: () => Promise.reject(new Error('Missing Supabase Environment Variables')),
            signOut: () => Promise.reject(new Error('Missing Supabase Environment Variables')),
        },
        from: () => ({
            select: () => ({
                eq: () => ({
                    single: () => Promise.reject(new Error('Missing Supabase Environment Variables'))
                })
            })
        })
    }
