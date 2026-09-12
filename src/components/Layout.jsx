import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Users, CreditCard, BarChart3, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { TutoreeLogo } from './TutoreeLogoIcon'

export function Layout({ children }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const teacherName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Teacher'

  const navLinks = [
    { to: '/students', label: 'Students', icon: <Users size={16} /> },
    { to: '/fees', label: 'Fees', icon: <CreditCard size={16} /> },
    { to: '/dashboard', label: 'Dashboard', icon: <BarChart3 size={16} /> },
  ]

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <TutoreeLogo iconSize={28} textSize="text-base" />

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map(link => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`
                    }
                  >
                    {link.icon}
                    {link.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* Profile + Logout */}
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm text-gray-500">
                {teacherName}
              </span>
              <button
                onClick={handleSignOut}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Logout"
              >
                <LogOut size={15} />
                <span className="hidden lg:inline">Logout</span>
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white animate-fadeIn">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  {link.icon}
                  {link.label}
                </NavLink>
              ))}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  )
}
