import { useState, useMemo } from 'react'
import { useCategories } from '../hooks/useCategories'
import { useTransactions } from '../hooks/useTransactions'
import Layout from '../components/Layout'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import { Plus, Trash2, Edit2, Loader2, Tag, Palette, DollarSign, AlertCircle } from 'lucide-react'
import { formatCurrency } from '../lib/formatCurrency'

export default function Categories() {
    const { categories, isLoading: isCatLoading, error, addCategory, updateCategory, deleteCategory } = useCategories()

    // Fetch transactions for current month to show progress
    const [currentMonth] = useState(new Date())
    const { transactions, isLoading: isTransLoading } = useTransactions(currentMonth)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState(null)
    const [formData, setFormData] = useState({ name: '', color: '#3b82f6', budget_limit: '' })

    // Calculate spending per category
    const categorySpending = useMemo(() => {
        if (!transactions) return {}
        return transactions.reduce((acc, t) => {
            if (t.type === 'expense' && t.category_id) {
                acc[t.category_id] = (acc[t.category_id] || 0) + Number(t.amount)
            }
            return acc
        }, {})
    }, [transactions])

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category)
            setFormData({
                name: category.name,
                color: category.color || '#3b82f6',
                budget_limit: category.budget_limit || ''
            })
        } else {
            setEditingCategory(null)
            setFormData({ name: '', color: '#3b82f6', budget_limit: '' })
        }
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingCategory(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const dataToSave = {
                ...formData,
                budget_limit: formData.budget_limit ? Number(formData.budget_limit) : 0
            }

            if (editingCategory) {
                await updateCategory.mutateAsync({ id: editingCategory.id, ...dataToSave })
            } else {
                await addCategory.mutateAsync(dataToSave)
            }
            handleCloseModal()
        } catch (err) {
            alert('Error saving category: ' + err.message)
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await deleteCategory.mutateAsync(id)
            } catch (err) {
                alert('Error deleting category: ' + err.message)
            }
        }
    }

    if (isCatLoading || isTransLoading) return (
        <Layout>
            <div className="h-[80vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-primary-600 h-8 w-8" />
            </div>
        </Layout>
    )

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories & Budget</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Set limits and track progress</p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus size={18} className="mr-2" />
                    Add Category
                </Button>
            </div>

            {error && <div className="text-red-600 mb-4 bg-red-50 p-4 rounded-xl">Error loading categories: {error.message}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-24 md:mb-0">
                {categories?.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 py-10">
                        No categories found. Create one to get started!
                    </div>
                )}
                {categories?.map((cat) => {
                    const spent = categorySpending[cat.id] || 0
                    const limit = Number(cat.budget_limit) || 0
                    const progress = limit > 0 ? (spent / limit) * 100 : 0
                    const isOverBudget = limit > 0 && spent > limit

                    return (
                        <div key={cat.id} className="bg-surface p-5 rounded-xl shadow-sm border border-border flex flex-col gap-4 hover:shadow-md transition">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-10 rounded-full shadow-sm"
                                        style={{ backgroundColor: cat.color || '#e5e7eb' }}
                                    />
                                    <div>
                                        <span className="font-semibold text-gray-900 dark:text-white block">{cat.name}</span>
                                        {limit > 0 && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                Limit: {formatCurrency(limit)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleOpenModal(cat)}
                                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-full transition"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Budget Progress Bar */}
                            {limit > 0 ? (
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className={`${isOverBudget ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'}`}>
                                            {formatCurrency(spent)} spent
                                        </span>
                                        <span className="text-gray-400">{Math.min(progress, 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-primary-500'}`}
                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                        />
                                    </div>
                                    {isOverBudget && (
                                        <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                                            <AlertCircle size={12} />
                                            <span>Over budget by {formatCurrency(spent - limit)}</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-xs text-gray-400 italic pt-2">
                                    No budget limit set
                                    <span className="block mt-1 text-gray-900 dark:text-white font-medium">
                                        Spent: {formatCurrency(spent)}
                                    </span>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingCategory ? 'Edit Category' : 'New Category'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Category Name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Food, Rent"
                        icon={Tag}
                    />

                    <Input
                        label="Monthly Budget Limit (Optional)"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.budget_limit}
                        onChange={(e) => setFormData({ ...formData, budget_limit: e.target.value })}
                        placeholder="0.00"
                        icon={DollarSign}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Color Tag</label>
                        <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                            <Palette size={20} className="text-gray-400" />
                            <input
                                type="color"
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                className="h-8 w-16 p-0 border-0 rounded cursor-pointer bg-transparent"
                            />
                            <span className="text-sm font-mono text-gray-500 dark:text-gray-400 uppercase">{formData.color}</span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleCloseModal}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={addCategory.isPending || updateCategory.isPending}
                        >
                            Save Category
                        </Button>
                    </div>
                </form>
            </Modal>
        </Layout>
    )
}
