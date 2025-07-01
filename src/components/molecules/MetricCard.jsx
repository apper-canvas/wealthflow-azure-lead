import React from 'react'
import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'

const MetricCard = ({ 
  title, 
  value, 
  change, 
  icon, 
  trend = 'neutral',
  prefix = '',
  suffix = '',
  className = '' 
}) => {
  const trendColors = {
    up: 'text-accent-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  }

  const trendIcons = {
    up: 'TrendingUp',
    down: 'TrendingDown',
    neutral: 'Minus'
  }

  const trendBgColors = {
    up: 'bg-gradient-to-br from-accent-100 to-accent-200',
    down: 'bg-gradient-to-br from-red-100 to-red-200',
    neutral: 'bg-gradient-to-br from-gray-100 to-gray-200'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`card-premium p-6 hover:shadow-card-hover transition-all duration-300 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${trendBgColors[trend]}`}>
          <ApperIcon name={icon} className={`w-6 h-6 ${trendColors[trend]}`} />
        </div>
        
        {change && (
          <div className={`flex items-center text-sm font-medium ${trendColors[trend]}`}>
            <ApperIcon name={trendIcons[trend]} className="w-4 h-4 mr-1" />
            {change}
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <p className="text-2xl font-bold gradient-text">
          {prefix}{value}{suffix}
        </p>
      </div>
    </motion.div>
  )
}

export default MetricCard