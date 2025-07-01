import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import ApperIcon from '@/components/ApperIcon'

const MobileNav = () => {
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
    <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-6 px-2 py-2">
        {navigation.map((item) => {
          const isActive = item.href === '/' 
            ? location.pathname === '/'
            : location.pathname.startsWith(item.href)
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={`
                flex flex-col items-center justify-center py-2 px-1 text-xs font-medium rounded-lg transition-all duration-200
                ${isActive
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-primary-600'
                }
              `}
            >
              <ApperIcon 
                name={item.icon} 
                className={`
                  h-5 w-5 mb-1 transition-colors duration-200
                  ${isActive ? 'text-primary-600' : 'text-gray-600'}
                `} 
              />
              <span className="truncate max-w-full">{item.name}</span>
            </NavLink>
          )
        })}
      </div>
    </div>
  )
}

export default MobileNav