import { useState } from 'react'
import { useCategories } from '../hooks/useCategories'
import Layout from '../components/Layout'
import { Plus, Trash2, Edit2, X, Save, Loader2 } from 'lucide-react'

export default function Categories() {
    const { categories, isLoading, error, addCategory, updateCategory, deleteCategory } = useCategories()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState(null) // null = create mode
    const [formData, setFormData] = useState({ name: '', color: '#3b82f6' })

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category)
            setFormData({ name: category.name, color: category.color || '#3b82f6' })
        } else {
            setEditingCategory(null)
            setFormData({ name: '', color: '#3b82f6' })
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
            if (editingCategory) {
                await updateCategory.mutateAsync({ id: editingCategory.id, ...formData })
            } else {
                await addCategory.mutateAsync(formData)
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

    if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Expense Categories</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus size={18} />
                    Add Category
                </button>
            </div>

            {error && <div className="text-red-600 mb-4">Error loading categories: {error.message}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories?.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 py-10">
                        No categories found. Create one to get started!
                    </div>
                )}
                {categories?.map((cat) => (
                    <div key={cat.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-4 h-10 rounded-full"
                                style={{ backgroundColor: cat.color || '#e5e7eb' }}
                            />
                            <span className="font-semibold text-gray-700">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleOpenModal(cat)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                            >
                                <Edit2 size={18} />
                            </button>
                            <button
                                onClick={() => handleDelete(cat.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal is simple for now, can be extracted */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">{editingCategory ? 'Edit Category' : 'New Category'}</h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="e.g. Food, Rent, Transport"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Color Tag</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        className="h-10 w-20 p-1 border rounded cursor-pointer"
                                    />
                                    <span className="text-sm text-gray-500">{formData.color}</span>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={addCategory.isPending || updateCategory.isPending}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {(addCategory.isPending || updateCategory.isPending) && <Loader2 className="animate-spin" size={16} />}
                                    Save Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    )
}
