import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from './layout/Sidebar'
import BottomNav from './layout/BottomNav'

export default function Layout({ children }) {
    const { signOut } = useAuth()
    const navigate = useNavigate()

    const handleSignOut = async () => {
        await signOut()
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-background flex text-text-primary font-sans">
            {/* Desktop Sidebar */}
            <Sidebar onSignOut={handleSignOut} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen w-full relative">
                <main className="flex-1 px-4 py-6 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <BottomNav />
        </div>
    )
}
