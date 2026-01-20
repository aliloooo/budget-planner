import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { User, Mail, LogOut, Shield, Bell, Moon } from 'lucide-react'

export default function Profile() {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()

    const handleSignOut = async () => {
        await signOut()
        navigate('/login')
    }

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Profile</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your account and preferences</p>
            </div>

            <div className="max-w-2xl space-y-6">
                {/* User Info Card */}
                <Card>
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center">
                            <User size={40} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">
                                {user?.email?.split('@')[0] || 'User'}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 text-sm mt-1">
                                <Mail size={14} />
                                {user?.email}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors">
                            <div className="flex items-center gap-3">
                                <Shield className="text-gray-400" size={20} />
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Security</p>
                                    <p className="text-xs text-gray-500">Password and authentication</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors">
                            <div className="flex items-center gap-3">
                                <Bell className="text-gray-400" size={20} />
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Notifications</p>
                                    <p className="text-xs text-gray-500">Manage budget alerts</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors">
                            <div className="flex items-center gap-3">
                                <Moon className="text-gray-400" size={20} />
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Appearance</p>
                                    <p className="text-xs text-gray-500">Dark mode and theme</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Account Actions */}
                <Card className="border-red-100 dark:border-red-900/30">
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-between p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                                <LogOut size={20} />
                            </div>
                            <span className="font-medium">Sign Out</span>
                        </div>
                    </button>
                </Card>

                <div className="text-center">
                    <p className="text-xs text-gray-400">BudgetPlanner v1.0.0</p>
                </div>
            </div>
        </Layout>
    )
}
