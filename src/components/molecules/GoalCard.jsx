import React from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'

const GoalCard = ({ goal, onEdit, onDelete, onContribute }) => {
  const progress = (goal.currentAmount / goal.targetAmount) * 100
  const isCompleted = progress >= 100
  
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="card-premium p-6 hover:shadow-card-hover transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          isCompleted 
            ? 'bg-gradient-to-br from-accent-100 to-accent-200'
            : 'bg-gradient-to-br from-primary-100 to-secondary-100'
        }`}>
          <ApperIcon 
            name={isCompleted ? "CheckCircle" : "Target"} 
            className={`w-6 h-6 ${
              isCompleted ? 'text-accent-600' : 'text-primary-600'
            }`} 
          />
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEdit(goal)}
            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
          >
            <ApperIcon name="Edit2" className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(goal.Id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
          >
            <ApperIcon name="Trash2" className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{goal.name}</h3>
          <p className="text-sm text-gray-600">
            Target: {format(new Date(goal.targetDate), 'MMM dd, yyyy')}
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-3 rounded-full ${
                isCompleted 
                  ? 'bg-gradient-to-r from-accent-400 to-accent-500'
                  : 'bg-gradient-to-r from-primary-400 to-secondary-500'
              }`}
            />
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-gray-900">
              {formatAmount(goal.currentAmount)}
            </span>
            <span className="text-gray-600">
              {formatAmount(goal.targetAmount)}
            </span>
          </div>
        </div>
        
        {!isCompleted && (
          <Button
            variant="primary"
            size="sm"
            icon="Plus"
            onClick={() => onContribute(goal)}
            className="w-full"
          >
            Add Contribution
          </Button>
        )}
        
        {isCompleted && (
          <div className="flex items-center justify-center p-3 bg-gradient-to-r from-accent-50 to-accent-100 rounded-lg">
            <ApperIcon name="Trophy" className="w-5 h-5 text-accent-600 mr-2" />
            <span className="text-accent-800 font-medium">Goal Completed!</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default GoalCard