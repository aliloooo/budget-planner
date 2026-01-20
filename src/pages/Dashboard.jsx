import { useState, useMemo } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import Layout from '../components/Layout'
import { ArrowUpCircle, ArrowDownCircle, Wallet, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addMonths, subMonths } from 'date-fns'
import ExpensePieChart from '../components/Charts/ExpensePieChart'
import IncomeExpenseChart from '../components/Charts/IncomeExpenseChart'
import { formatCurrency } from '../lib/formatCurrency'

export default function Dashboard() {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const { transactions, isLoading, useRecentTransactions } = useTransactions(currentMonth)
    const { data: recentTransactions } = useRecentTransactions()

    const handleMonthChange = (direction) => {
        setCurrentMonth(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1))
    }

    // Calculate Stats
    const stats = useMemo(() => {
        if (!transactions) return { income: 0, expense: 0, balance: 0, byCategory: [] }

        let income = 0;
        let expense = 0;
        const categoryTotals = {};

        transactions.forEach(t => {
            const amount = Number(t.amount);
            if (t.type === 'income') {
                income += amount;
            } else {
                expense += amount;
                // Aggregate expenses by category
                if (t.categories) {
                    const catName = t.categories.name;
                    if (!categoryTotals[catName]) {
                        categoryTotals[catName] = {
                            name: catName,
                            value: 0,
                            color: t.categories.color
                        };
                    }
                    categoryTotals[catName].value += amount;
                } else {
                    if (!categoryTotals['Uncategorized']) {
                        categoryTotals['Uncategorized'] = { name: 'Uncategorized', value: 0, color: '#9ca3af' };
                    }
                    categoryTotals['Uncategorized'].value += amount;
                }
            }
        });

        return {
            income,
            expense,
            balance: income - expense,
            byCategory: Object.values(categoryTotals).sort((a, b) => b.value - a.value)
        }
    }, [transactions])

    if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600 h-8 w-8" /></div>

    return (
        <Layout>
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-gray-500 text-sm">Overview of your finances</p>
                </div>

                <div className="flex items-center gap-4 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                    <button onClick={() => handleMonthChange('prev')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="font-semibold w-36 text-center text-gray-800">
                        {format(currentMonth, 'MMMM yyyy')}
                    </span>
                    <button onClick={() => handleMonthChange('next')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Balance</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.balance)}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                        <Wallet size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Income</p>
                        <h3 className="text-2xl font-bold text-green-600 mt-1">+{formatCurrency(stats.income)}</h3>
                    </div>
                    <div className="p-3 bg-green-50 text-green-600 rounded-full">
                        <ArrowUpCircle size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Expenses</p>
                        <h3 className="text-2xl font-bold text-red-600 mt-1">-{formatCurrency(stats.expense)}</h3>
                    </div>
                    <div className="p-3 bg-red-50 text-red-600 rounded-full">
                        <ArrowDownCircle size={24} />
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Expense Distribution</h3>
                    <ExpensePieChart data={stats.byCategory} />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Cash Flow</h3>
                    <IncomeExpenseChart data={[{ name: 'Income', value: stats.income }, { name: 'Expense', value: stats.expense }]} />
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-800">Recent Transactions</h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {recentTransactions?.map(t => (
                        <div key={t.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-500 font-bold"
                                    style={{ backgroundColor: t.categories?.color ? `${t.categories.color}20` : '#f3f4f6', color: t.categories?.color || '#9ca3af' }}>
                                    {t.categories?.name?.[0] || '?'}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate max-w-[150px] sm:max-w-xs">{t.description || t.categories?.name || 'Untitled'}</p>
                                    <p className="text-xs text-gray-500">{format(new Date(t.transaction_date), 'dd MMM yyyy')}</p>
                                </div>
                            </div>
                            <span className={`font-semibold text-sm whitespace-nowrap ${t.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                                {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                            </span>
                        </div>
                    ))}
                    {(!recentTransactions || recentTransactions.length === 0) && (
                        <div className="p-8 text-center text-gray-400">
                            <p>No recent transactions</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    )
}
