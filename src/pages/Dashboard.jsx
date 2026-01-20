import { useState, useMemo, lazy, Suspense } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import Layout from '../components/Layout'
import Card from '../components/ui/Card'
import { ArrowUpCircle, ArrowDownCircle, Wallet, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addMonths, subMonths } from 'date-fns'
import { formatCurrency } from '../lib/formatCurrency'

const ExpensePieChart = lazy(() => import('../components/Charts/ExpensePieChart'))
const IncomeExpenseChart = lazy(() => import('../components/Charts/IncomeExpenseChart'))

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

    if (isLoading) return (
        <Layout>
            <div className="h-[80vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-primary-600 h-8 w-8" />
            </div>
        </Layout>
    )

    return (
        <Layout>
            {/* Header Section */}
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Overview of your finances</p>
                </div>

                <div className="flex items-center gap-2 bg-surface p-1.5 rounded-xl shadow-sm border border-border">
                    <button
                        onClick={() => handleMonthChange('prev')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="font-semibold w-36 text-center text-gray-800 dark:text-gray-200 text-sm">
                        {format(currentMonth, 'MMMM yyyy')}
                    </span>
                    <button
                        onClick={() => handleMonthChange('next')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                <Card className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Balance</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                            {formatCurrency(stats.balance)}
                        </h3>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full">
                        <Wallet size={24} />
                    </div>
                </Card>

                <Card className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Income</p>
                        <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                            +{formatCurrency(stats.income)}
                        </h3>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full">
                        <ArrowUpCircle size={24} />
                    </div>
                </Card>

                <Card className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Expenses</p>
                        <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                            -{formatCurrency(stats.expense)}
                        </h3>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full">
                        <ArrowDownCircle size={24} />
                    </div>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">Expense Distribution</h3>
                    <Suspense fallback={<div className="h-72 flex items-center justify-center"><Loader2 className="animate-spin text-gray-400" /></div>}>
                        <ExpensePieChart data={stats.byCategory} />
                    </Suspense>
                </Card>
                <Card>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">Cash Flow</h3>
                    <Suspense fallback={<div className="h-72 flex items-center justify-center"><Loader2 className="animate-spin text-gray-400" /></div>}>
                        <IncomeExpenseChart data={[{ name: 'Income', value: stats.income }, { name: 'Expense', value: stats.expense }]} />
                    </Suspense>
                </Card>
            </div>

            {/* Recent Transactions */}
            <Card noPadding className="mb-20 md:mb-0">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Recent Transactions</h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {recentTransactions?.map(t => (
                        <div key={t.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
                                    style={{ backgroundColor: t.categories?.color || '#9ca3af' }}>
                                    {t.categories?.name?.[0] || '?'}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[120px] sm:max-w-xs">
                                        {t.description || t.categories?.name || 'Untitled'}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {format(new Date(t.transaction_date), 'dd MMM yyyy')}
                                    </p>
                                </div>
                            </div>
                            <span className={`font-semibold text-sm whitespace-nowrap ${t.type === 'income'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-gray-900 dark:text-gray-100'
                                }`}>
                                {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                            </span>
                        </div>
                    ))}
                    {(!recentTransactions || recentTransactions.length === 0) && (
                        <div className="p-8 text-center text-gray-400 dark:text-gray-500">
                            <p>No recent transactions</p>
                        </div>
                    )}
                </div>
            </Card>
        </Layout>
    )
}
