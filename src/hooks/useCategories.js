import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useCategories() {
    const queryClient = useQueryClient()

    const { data: categories, isLoading, error } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name')

            if (error) throw error
            return data
        }
    })

    const addCategory = useMutation({
        mutationFn: async (category) => {
            // category should allow { name, color, user_id (handled by RLS default auth.uid() if set properly, but Supabase client sends auth token. 
            // Actually RLS policy says "using (auth.uid() = user_id)" for insert check?? 
            // Wait, let's check the SQL. 
            // "create policy ... with check (auth.uid() = user_id);"
            // This usually requires sending user_id or defaulting it. 
            // Since I didn't set default user_id = auth.uid() in schema (which you can't easily do in pure SQL without triggers), 
            // the client MUST send user_id.

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("No user found")

            const { data, error } = await supabase
                .from('categories')
                .insert([{ ...category, user_id: user.id }])
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['categories'])
        }
    })

    const updateCategory = useMutation({
        mutationFn: async ({ id, ...updates }) => {
            const { data, error } = await supabase
                .from('categories')
                .update(updates)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['categories'])
        }
    })

    const deleteCategory = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['categories'])
        }
    })

    return {
        categories,
        isLoading,
        error,
        addCategory,
        updateCategory,
        deleteCategory
    }
}
