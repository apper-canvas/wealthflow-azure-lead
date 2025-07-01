import React from 'react'
import ApperIcon from '@/components/ApperIcon'

const Empty = ({ 
  title = "No data found", 
  description = "Get started by adding some data", 
  actionText = "Add New",
  onAction,
  icon = "Inbox"
}) => {
  return (
    <div className="card-premium p-12 text-center">
      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center">
        <ApperIcon name={icon} className="w-10 h-10 text-primary-600" />
      </div>
      
      <h3 className="text-2xl font-bold gradient-text mb-3">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
        {description}
      </p>
      
      {onAction && (
        <button
          onClick={onAction}
          className="btn-primary inline-flex items-center space-x-2 px-6 py-3"
        >
          <ApperIcon name="Plus" className="w-5 h-5" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  )
}

export default Empty