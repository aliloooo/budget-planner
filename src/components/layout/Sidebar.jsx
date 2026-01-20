import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, List, Settings, User, LogOut } from 'lucide-react'

export default function Sidebar({ onSignOut }) {
    const location = useLocation()

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Transactions', path: '/transactions', icon: List },
        { name: 'Categories', path: '/categories', icon: Settings },
        { name: 'Profile', path: '/profile', icon: User },
    ]

    return (
        <aside className="w-64 bg-surface border-r border-border hidden md:flex flex-col h-screen sticky top-0">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
                    BudgetPlanner
                </h1>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            <Icon size={20} />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-border">
                <button
                    onClick={onSignOut}
                    className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10 rounded-xl transition-colors cursor-pointer"
                >
                    <LogOut size={20} />
                    Sign Out
                </button>
            </div>
        </aside>
    )
}
