'use client'

import './sidebar.css'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  HomeIcon,
  UserIcon,
  CogIcon,
  ChartBarIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline'

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  const links = [
    { href: '/dashboard', icon: <HomeIcon className="h-5 w-5 mr-3" />, label: 'Dashboard' },
    { href: '/profile', icon: <UserIcon className="h-5 w-5 mr-3" />, label: 'Profil' },
    { href: '/settings', icon: <CogIcon className="h-5 w-5 mr-3" />, label: 'Paramètres' },
    { href: '/statistics', icon: <ChartBarIcon className="h-5 w-5 mr-3" />, label: 'Statistiques' },
  ]

  return (
    <aside className="sidebar">
      <div>
        <h2 className="flex items-center text-2xl font-semibold mb-6 text-white">
          <PrinterIcon className="h-7 w-7 mr-2 text-white" />
          Printrack
        </h2>
        <nav>
          {links.map(({ href, icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center mb-4 px-2 py-2 rounded-md transition-all duration-200 ${
                pathname === href ? 'active' : ''
              }`}
            >
              {icon}
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <button className="logout-btn" onClick={handleLogout}>
        Déconnexion
      </button>
    </aside>
  )
}
