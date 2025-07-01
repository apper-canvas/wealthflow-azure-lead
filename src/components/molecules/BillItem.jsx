import React from 'react'
import { motion } from 'framer-motion'
import { format, isAfter, isBefore, addDays } from 'date-fns'
import ApperIcon from '@/components/ApperIcon'
import Badge from '@/components/atoms/Badge'

const BillItem = ({ bill, onEdit, onDelete, onMarkPaid }) => {
  const today = new Date()
  const dueDate = new Date(bill.dueDate)
  const isOverdue = bill.status === 'pending' && isBefore(dueDate, today)
  const isDueSoon = bill.status === 'pending' && isAfter(dueDate, today) && isBefore(dueDate, addDays(today, 3))
  
  const getStatusVariant = () => {
    if (bill.status === 'paid') return 'success'
    if (bill.status === 'overdue' || isOverdue) return 'danger'
    if (isDueSoon) return 'warning'
    return 'default'
  }

  const getStatusText = () => {
    if (bill.status === 'paid') return 'Paid'
    if (bill.status === 'overdue' || isOverdue) return 'Overdue'
    if (isDueSoon) return 'Due Soon'
    return 'Pending'
  }

  const billIcons = {
    'Rent': 'Home',
    'Electricity': 'Zap',
    'Internet': 'Wifi',
    'Phone': 'Phone',
    'Water': 'Droplets',
    'Car Insurance': 'Car',
    'Credit Card': 'CreditCard',
    'Netflix': 'Monitor',
    'Other': 'FileText'
  }

  const getBillIcon = (name) => {
    for (const [key, icon] of Object.entries(billIcons)) {
      if (name.toLowerCase().includes(key.toLowerCase())) {
        return icon
      }
    }
    return 'FileText'
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
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
          bill.status === 'paid' 
            ? 'bg-gradient-to-br from-accent-100 to-accent-200'
            : isOverdue
            ? 'bg-gradient-to-br from-red-100 to-red-200'
            : 'bg-gradient-to-br from-gray-100 to-gray-200'
        }`}>
          <ApperIcon 
            name={getBillIcon(bill.name)} 
            className={`w-6 h-6 ${
              bill.status === 'paid' 
                ? 'text-accent-600'
                : isOverdue
                ? 'text-red-600'
                : 'text-gray-600'
            }`} 
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 truncate">
            {bill.name}
          </h4>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant={getStatusVariant()} size="sm">
              {getStatusText()}
            </Badge>
            <span className="text-xs text-gray-500">
              Due: {format(dueDate, 'MMM dd, yyyy')}
            </span>
            {bill.recurring && (
              <Badge variant="info" size="sm">
                <ApperIcon name="Repeat" className="w-3 h-3 mr-1" />
                Recurring
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-lg font-bold text-gray-900">
          {formatAmount(bill.amount)}
        </div>
        
        <div className="flex items-center space-x-1">
          {bill.status === 'pending' && (
            <button
              onClick={() => onMarkPaid(bill.Id)}
              className="p-2 text-gray-400 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-all duration-200"
              title="Mark as Paid"
            >
              <ApperIcon name="CheckCircle" className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onEdit(bill)}
            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
          >
            <ApperIcon name="Edit2" className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(bill.Id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
          >
            <ApperIcon name="Trash2" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default BillItem