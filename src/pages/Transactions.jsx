import { useState } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import Layout from '../components/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { Plus, Trash2, Edit2, ChevronLeft, ChevronRight, Download, Loader2, Calendar, Tag, FileText, DollarSign, AlignLeft } from 'lucide-react'
import { format, addMonths, subMonths, parseISO } from 'date-fns'
import { formatCurrency } from '../lib/formatCurrency'

export default function Transactions() {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const { transactions, isLoading, addTransaction, updateTransaction, deleteTransaction } = useTransactions(currentMonth)
    const { categories } = useCategories()

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
                    `"${(t.description || '').replace(/"/g, '""')}"`
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your income and expenses</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 bg-surface p-1 rounded-xl shadow-sm border border-border">
                        <button onClick={() => handleMonthChange('prev')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
                            <ChevronLeft size={20} />
                        </button>
                        <span className="font-semibold w-32 text-center text-gray-800 dark:text-gray-200 text-sm">
                            {format(currentMonth, 'MMMM yyyy')}
                        </span>
                        <button onClick={() => handleMonthChange('next')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={handleExport} className="hidden sm:flex">
                            <Download size={18} className="mr-2" />
                            Export
                        </Button>
                        <Button variant="primary" onClick={() => handleOpenModal()}>
                            <Plus size={18} className="mr-2" />
                            Add
                        </Button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary-600" /></div>
            ) : (
                <Card noPadding className="mb-24 md:mb-0">
                    {transactions?.length === 0 ? (
                        <div className="p-10 text-center text-gray-400 dark:text-gray-500">
                            No transactions found for this month.
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                                        <tr>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Category</th>
                                            <th className="px-6 py-4">Description</th>
                                            <th className="px-6 py-4">Type</th>
                                            <th className="px-6 py-4 text-right">Amount</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {transactions?.map((t) => (
                                            <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                    {format(parseISO(t.transaction_date), 'dd MMM yyyy')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="px-3 py-1 rounded-full text-xs font-medium w-fit flex items-center gap-2"
                                                        style={{ backgroundColor: t.categories?.color ? `${t.categories.color}20` : '#f3f4f6', color: t.categories?.color || '#374151' }}>
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.categories?.color || '#9ca3af' }} />
                                                        {t.categories?.name || 'Uncategorized'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                                                    {t.description || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${t.type === 'income'
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                        }`}>
                                                        {t.type}
                                                    </span>
                                                </td>
                                                <td className={`px-6 py-4 text-right font-medium whitespace-nowrap ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'
                                                    }`}>
                                                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => handleOpenModal(t)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition">
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button onClick={() => handleDelete(t.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile List View */}
                            <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
                                {transactions?.map((t) => (
                                    <div key={t.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/30 transition active:bg-gray-100" onClick={() => handleOpenModal(t)}>
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-xs shadow-sm"
                                                style={{ backgroundColor: t.categories?.color || '#9ca3af' }}>
                                                {t.categories?.name?.[0] || '?'}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                        {t.description || t.categories?.name || 'Untitled'}
                                                    </p>
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase ${t.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {t.type}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                    <Calendar size={10} />
                                                    {format(parseISO(t.transaction_date), 'dd MMM')}
                                                    <span className="mx-1">•</span>
                                                    {t.categories?.name || 'Uncategorized'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 pl-2">
                                            <span className={`font-semibold text-sm whitespace-nowrap ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'
                                                }`}>
                                                {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </Card>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? 'Edit Transaction' : 'New Transaction'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Type"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            icon={AlignLeft} // Just an icon placeholder
                        >
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                        </Select>

                        <Input
                            label="Amount"
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            placeholder="0.00"
                            icon={DollarSign}
                        />
                    </div>

                    <Select
                        label="Category"
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        required
                        icon={Tag}
                    >
                        <option value="">Select Category</option>
                        {categories?.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </Select>
                    {categories?.length === 0 && <p className="text-xs text-red-500 mt-1">Please create categories first.</p>}

                    <Input
                        label="Date"
                        type="date"
                        required
                        value={formData.transaction_date}
                        onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                        icon={Calendar}
                    />

                    <div>
                        <Input
                            label="Description (Optional)"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="What was this for?"
                            icon={FileText}
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={addTransaction.isPending || updateTransaction.isPending}
                        >
                            Save Transaction
                        </Button>
                    </div>
                </form>
            </Modal>
        </Layout>
    )
}
