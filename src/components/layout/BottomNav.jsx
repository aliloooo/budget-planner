import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, List, Settings, User } from 'lucide-react'

export default function BottomNav() {
    const location = useLocation()

    const navItems = [
        { name: 'Home', path: '/', icon: LayoutDashboard },
        { name: 'Trans.', path: '/transactions', icon: List },
        { name: 'Budget', path: '/categories', icon: Settings }, // Using Categories as Budget for now
        { name: 'Profile', path: '/profile', icon: User }, // Placeholder for profile/settings
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border md:hidden z-50 pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive
                                    ? 'text-primary-600 dark:text-primary-400'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
