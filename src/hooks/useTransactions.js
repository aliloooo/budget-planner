import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { startOfMonth, endOfMonth, format } from 'date-fns'

export function useTransactions(currentMonth = new Date()) {
    const queryClient = useQueryClient()

    // Format dates for filtering (PostgreSQL expects ISO strings mostly, but for comparison simple dates work)
    const start = startOfMonth(currentMonth).toISOString()
    const end = endOfMonth(currentMonth).toISOString()

    const { data: transactions, isLoading, error } = useQuery({
        queryKey: ['transactions', format(currentMonth, 'yyyy-MM')],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('transactions')
                .select(`
          *,
          categories (
             id,
             name,
             color
          )
        `)
                .gte('transaction_date', start)
                .lte('transaction_date', end)
                .order('transaction_date', { ascending: false })

            if (error) throw error
            return data
        }
    })

    // Hook for recent transactions (Dashboard) - not limited to month, just last 5
    const useRecentTransactions = () => useQuery({
        queryKey: ['recent_transactions'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('transactions')
                .select(`
            *,
            categories (id, name, color)
        `)
                .order('transaction_date', { ascending: false })
                .limit(5)
            if (error) throw error
            return data
        }
    })

    const addTransaction = useMutation({
        mutationFn: async (transaction) => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("No user found")

            const { data, error } = await supabase
                .from('transactions')
                .insert([{ ...transaction, user_id: user.id }])
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['transactions'])
            queryClient.invalidateQueries(['recent_transactions'])
            queryClient.invalidateQueries(['dashboard_stats']) // Future proofing
        }
    })

    const updateTransaction = useMutation({
        mutationFn: async ({ id, ...updates }) => {
            const { data, error } = await supabase
                .from('transactions')
                .update(updates)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['transactions'])
            queryClient.invalidateQueries(['recent_transactions'])
            queryClient.invalidateQueries(['dashboard_stats'])
        }
    })

    const deleteTransaction = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['transactions'])
            queryClient.invalidateQueries(['recent_transactions'])
            queryClient.invalidateQueries(['dashboard_stats'])
        }
    })

    return {
        transactions,
        isLoading,
        error,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        useRecentTransactions
    }
}
