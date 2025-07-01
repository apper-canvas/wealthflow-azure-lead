import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import ApperIcon from '@/components/ApperIcon'

const Sidebar = () => {
  const location = useLocation()
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
    { name: 'Transactions', href: '/transactions', icon: 'ArrowLeftRight' },
    { name: 'Budget', href: '/budget', icon: 'PieChart' },
    { name: 'Goals', href: '/goals', icon: 'Target' },
    { name: 'Bills', href: '/bills', icon: 'FileText' },
    { name: 'Reports', href: '/reports', icon: 'BarChart3' }
  ]

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
      <div className="flex flex-col flex-grow bg-gradient-to-b from-primary-900 to-primary-800 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-6 py-8">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-400 to-accent-500 rounded-xl flex items-center justify-center mr-3">
              <ApperIcon name="TrendingUp" className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">WealthFlow</h1>
              <p className="text-primary-300 text-sm">Personal Finance</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-8 flex-1 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = item.href === '/' 
              ? location.pathname === '/'
              : location.pathname.startsWith(item.href)
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                  ${isActive
                    ? 'bg-white/10 text-white shadow-lg backdrop-blur-sm border border-white/20'
                    : 'text-primary-200 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <ApperIcon 
                  name={item.icon} 
                  className={`
                    mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200
                    ${isActive ? 'text-accent-300' : 'text-primary-300 group-hover:text-white'}
                  `} 
                />
                {item.name}
              </NavLink>
            )
          })}
        </nav>

        {/* Account Summary */}
        <div className="flex-shrink-0 px-4 pb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-400 to-accent-500 rounded-lg flex items-center justify-center mr-3">
                <ApperIcon name="User" className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">John Doe</p>
                <p className="text-xs text-primary-300">Premium Account</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar