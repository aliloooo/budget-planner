import { useState } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import Layout from '../components/Layout'
import { Plus, Trash2, Edit2, X, ChevronLeft, ChevronRight, Filter, Search, Loader2, Download } from 'lucide-react'
import { format, addMonths, subMonths, parseISO } from 'date-fns'
import { formatCurrency } from '../lib/formatCurrency'

export default function Transactions() {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const { transactions, isLoading, addTransaction, updateTransaction, deleteTransaction } = useTransactions(currentMonth)
    const { categories } = useCategories() // For dropdown

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)

    // Form State
    const initialFormState = {
        amount: '',
        type: 'expense',
        category_id: '',
        description: '',
        transaction_date: format(new Date(), 'yyyy-MM-dd')
    }
    const [formData, setFormData] = useState(initialFormState)

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item)
            setFormData({
                amount: item.amount,
                type: item.type,
                category_id: item.category_id,
                description: item.description || '',
                transaction_date: item.transaction_date
            })
        } else {
            setEditingItem(null)
            setFormData(initialFormState)
            // If categories exist, default detailed category selection could be improved, but 'required' works
        }
        setIsModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingItem) {
                await updateTransaction.mutateAsync({ id: editingItem.id, ...formData })
            } else {
                await addTransaction.mutateAsync(formData)
            }
            setIsModalOpen(false)
        } catch (err) {
            alert('Error saving transaction: ' + err.message)
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Delete this transaction?')) {
            await deleteTransaction.mutateAsync(id)
        }
    }

    const handleMonthChange = (direction) => {
        setCurrentMonth(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1))
    }

    const handleExport = () => {
        if (!transactions || transactions.length === 0) return alert('No transactions to export')

        const headers = ['Date', 'Category', 'Type', 'Amount', 'Description']
        const csvContent = [
            headers.join(','),
            ...transactions.map(t => {
                const row = [
                    t.transaction_date,
                    t.categories?.name || 'Uncategorized',
                    t.type,
                    t.amount,
                    `"${(t.description || '').replace(/"/g, '""')}"` // Escape quotes
                ]
                return row.join(',')
            })
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `transactions-${format(currentMonth, 'yyyy-MM')}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
    }

    return (
        <Layout>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
                    <p className="text-gray-500 text-sm">Manage your income and expenses</p>
                </div>

                <div className="flex items-center gap-4 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                    <button onClick={() => handleMonthChange('prev')} className="p-2 hover:bg-gray-100 rounded-lg">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="font-semibold w-32 text-center">
                        {format(currentMonth, 'MMMM yyyy')}
                    </span>
                    <button onClick={() => handleMonthChange('next')} className="p-2 hover:bg-gray-100 rounded-lg">
                        <ChevronRight size={20} />
                    </button>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-white text-gray-600 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                    >
                        <Download size={18} />
                        Export
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus size={18} />
                        Add Transaction
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600" /></div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {transactions?.length === 0 ? (
                        <div className="p-10 text-center text-gray-400">
                            No transactions found for this month.
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {transactions?.map((t) => (
                                    <tr key={t.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {format(parseISO(t.transaction_date), 'dd MMM yyyy')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="px-3 py-1 rounded-full text-xs font-medium w-fit flex items-center gap-2"
                                                style={{ backgroundColor: t.categories?.color ? `${t.categories.color}20` : '#f3f4f6', color: t.categories?.color || '#374151' }}>
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.categories?.color || '#9ca3af' }} />
                                                {t.categories?.name || 'Uncategorized'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                                            {t.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${t.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {t.type}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 text-right font-medium whitespace-nowrap ${t.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                                            {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleOpenModal(t)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(t.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">{editingItem ? 'Edit Transaction' : 'New Transaction'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="expense">Expense</option>
                                        <option value="income">Income</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Select Category</option>
                                    {categories?.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                {categories?.length === 0 && <p className="text-xs text-red-500 mt-1">Please create categories first.</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.transaction_date}
                                    onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    placeholder="What was this for?"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={addTransaction.isPending || updateTransaction.isPending}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {(addTransaction.isPending || updateTransaction.isPending) && <Loader2 className="animate-spin" size={16} />}
                                    Save Transaction
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    )
}
