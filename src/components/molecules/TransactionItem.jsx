import React from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import ApperIcon from '@/components/ApperIcon'
import Badge from '@/components/atoms/Badge'

const TransactionItem = ({ transaction, onEdit, onDelete }) => {
  const categoryIcons = {
    'Salary': 'DollarSign',
    'Freelance': 'Briefcase',
    'Rent': 'Home',
    'Groceries': 'ShoppingCart',
    'Utilities': 'Zap',
    'Transportation': 'Car',
    'Entertainment': 'Film',
    'Healthcare': 'Heart',
    'Shopping': 'ShoppingBag',
    'Subscriptions': 'Repeat',
    'Other': 'MoreHorizontal'
  }

  const getCategoryIcon = (category) => {
    return categoryIcons[category] || 'MoreHorizontal'
  }

  const formatAmount = (amount, type) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
    
    return type === 'income' ? `+${formatted}` : `-${formatted}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      whileHover={{ scale: 1.02 }}
      className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center space-x-4 flex-1">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          transaction.type === 'income' 
            ? 'bg-gradient-to-br from-accent-100 to-accent-200' 
            : 'bg-gradient-to-br from-gray-100 to-gray-200'
        }`}>
          <ApperIcon 
            name={getCategoryIcon(transaction.category)} 
            className={`w-6 h-6 ${
              transaction.type === 'income' ? 'text-accent-600' : 'text-gray-600'
            }`} 
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 truncate">
            {transaction.description}
          </h4>
          <div className="flex items-center space-x-2 mt-1">
            <Badge 
              variant={transaction.type === 'income' ? 'success' : 'default'}
              size="sm"
            >
              {transaction.category}
            </Badge>
            <span className="text-xs text-gray-500">
              {format(new Date(transaction.date), 'MMM dd, yyyy')}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className={`text-lg font-bold ${
          transaction.type === 'income' ? 'text-accent-600' : 'text-gray-900'
        }`}>
          {formatAmount(transaction.amount, transaction.type)}
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEdit(transaction)}
            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
          >
            <ApperIcon name="Edit2" className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(transaction.Id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
          >
            <ApperIcon name="Trash2" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default TransactionItem