import React from 'react'
import ApperIcon from '@/components/ApperIcon'

const Header = () => {
  return (
    <div className="lg:hidden bg-gradient-to-r from-primary-600 to-secondary-600 px-4 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3">
            <ApperIcon name="TrendingUp" className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">WealthFlow</h1>
            <p className="text-primary-200 text-sm">Personal Finance</p>
          </div>
        </div>
        
        <button className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
          <ApperIcon name="Bell" className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}

export default Header