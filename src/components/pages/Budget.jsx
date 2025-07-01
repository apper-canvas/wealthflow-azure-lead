import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Select from '@/components/atoms/Select'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import ApperIcon from '@/components/ApperIcon'
import budgetService from '@/services/api/budgetService'
import transactionService from '@/services/api/transactionService'

const Budget = () => {
  const [budgets, setBudgets] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [currentBudget, setCurrentBudget] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [categoryBudgets, setCategoryBudgets] = useState({})

  const categories = [
    'Rent', 'Groceries', 'Utilities', 'Transportation', 
    'Entertainment', 'Healthcare', 'Shopping', 'Subscriptions'
  ]

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const [budgetsData, transactionsData] = await Promise.all([
        budgetService.getAll(),
        transactionService.getAll()
      ])
      
      setBudgets(budgetsData)
      setTransactions(transactionsData)
      
      const monthBudget = budgetsData.find(b => b.month === selectedMonth)
      setCurrentBudget(monthBudget)
      
      if (monthBudget) {
        setCategoryBudgets(monthBudget.categories)
      } else {
        setCategoryBudgets({})
      }
    } catch (err) {
      setError('Failed to load budget data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const monthBudget = budgets.find(b => b.month === selectedMonth)
    setCurrentBudget(monthBudget)
    
    if (monthBudget) {
      setCategoryBudgets(monthBudget.categories)
    } else {
      setCategoryBudgets({})
    }
  }, [selectedMonth, budgets])

  const getSpentAmount = (category) => {
    return transactions
      .filter(t => 
        t.type === 'expense' && 
        t.category === category && 
        t.date.startsWith(selectedMonth)
      )
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const getBudgetProgress = (category, budgetAmount) => {
    const spent = getSpentAmount(category)
    return budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0
  }

  const handleSaveBudget = async () => {
    const totalLimit = Object.values(categoryBudgets).reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0)
    
    if (totalLimit === 0) {
      toast.error('Please set at least one category budget')
      return
    }

    try {
      const budgetData = {
        month: selectedMonth,
        categories: Object.fromEntries(
          Object.entries(categoryBudgets).map(([cat, amount]) => [cat, parseFloat(amount) || 0])
        ),
        totalLimit
      }

      if (currentBudget) {
        await budgetService.update(currentBudget.Id, budgetData)
        toast.success('Budget updated successfully')
      } else {
        await budgetService.create(budgetData)
        toast.success('Budget created successfully')
      }

      await loadData()
      setShowForm(false)
    } catch (err) {
      toast.error('Failed to save budget')
    }
  }

  const resetBudgets = () => {
    if (currentBudget) {
      setCategoryBudgets(currentBudget.categories)
    } else {
      setCategoryBudgets({})
    }
    setShowForm(false)
  }

  const getTotalBudgeted = () => {
    return Object.values(categoryBudgets).reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0)
  }

  const getTotalSpent = () => {
    return categories.reduce((sum, category) => sum + getSpentAmount(category), 0)
  }

  const getOverallProgress = () => {
    const totalBudgeted = getTotalBudgeted()
    const totalSpent = getTotalSpent()
    return totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0
  }

  if (loading) return <Loading type="cards" />
  if (error) return <Error message={error} onRetry={loadData} />

  const overallProgress = getOverallProgress()
  const totalBudgeted = getTotalBudgeted()
  const totalSpent = getTotalSpent()
  const remaining = totalBudgeted - totalSpent

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Budget</h1>
          <p className="text-gray-600 mt-1">Manage your monthly spending limits</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            options={[
              { value: '2024-01', label: 'January 2024' },
              { value: '2024-02', label: 'February 2024' },
              { value: '2024-03', label: 'March 2024' },
              { value: '2024-04', label: 'April 2024' },
              { value: '2024-05', label: 'May 2024' },
              { value: '2024-06', label: 'June 2024' }
            ]}
          />
          
          <Button
            variant="primary"
            icon="Plus"
            onClick={() => setShowForm(true)}
          >
            {currentBudget ? 'Edit Budget' : 'Create Budget'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
              <ApperIcon name="Target" className="w-6 h-6 text-primary-600" />
            </div>
            <div className={`text-sm font-medium ${
              overallProgress <= 80 ? 'text-accent-600' : overallProgress <= 100 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {Math.round(overallProgress)}%
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Budgeted</h3>
          <p className="text-2xl font-bold text-gray-900">${totalBudgeted.toLocaleString()}</p>
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center">
              <ApperIcon name="CreditCard" className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Spent</h3>
          <p className="text-2xl font-bold text-gray-900">${totalSpent.toLocaleString()}</p>
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              remaining >= 0 
                ? 'bg-gradient-to-br from-accent-100 to-accent-200'
                : 'bg-gradient-to-br from-red-100 to-red-200'
            }`}>
              <ApperIcon 
                name="PiggyBank" 
                className={`w-6 h-6 ${remaining >= 0 ? 'text-accent-600' : 'text-red-600'}`} 
              />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Remaining</h3>
          <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-accent-600' : 'text-red-600'}`}>
            ${Math.abs(remaining).toLocaleString()}
          </p>
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-xl flex items-center justify-center">
              <ApperIcon name="Calendar" className="w-6 h-6 text-secondary-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Selected Month</h3>
          <p className="text-lg font-bold text-gray-900">
            {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Budget Categories */}
      {Object.keys(categoryBudgets).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.filter(cat => categoryBudgets[cat] > 0).map((category) => {
            const budgetAmount = categoryBudgets[category] || 0
            const spentAmount = getSpentAmount(category)
            const progress = getBudgetProgress(category, budgetAmount)
            const isOverBudget = progress > 100
            const isNearLimit = progress > 80 && progress <= 100

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-premium p-6 hover:shadow-card-hover transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                  <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                    isOverBudget 
                      ? 'bg-red-100 text-red-700'
                      : isNearLimit
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-accent-100 text-accent-700'
                  }`}>
                    {Math.round(progress)}%
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Spent</span>
                    <span className="font-medium">${spentAmount.toLocaleString()}</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-3 rounded-full ${
                        isOverBudget
                          ? 'bg-gradient-to-r from-red-400 to-red-500'
                          : isNearLimit
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                          : 'bg-gradient-to-r from-accent-400 to-accent-500'
                      }`}
                    />
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Budget</span>
                    <span className="font-medium">${budgetAmount.toLocaleString()}</span>
                  </div>

                  <div className={`text-center p-2 rounded-lg ${
                    spentAmount <= budgetAmount
                      ? 'bg-accent-50 text-accent-700'
                      : 'bg-red-50 text-red-700'
                  }`}>
                    <span className="text-sm font-medium">
                      {spentAmount <= budgetAmount
                        ? `$${(budgetAmount - spentAmount).toLocaleString()} remaining`
                        : `$${(spentAmount - budgetAmount).toLocaleString()} over budget`
                      }
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <Empty
          title="No budget set for this month"
          description="Create a budget to start tracking your spending limits"
          actionText="Create Budget"
          onAction={() => setShowForm(true)}
          icon="PieChart"
        />
      )}

      {/* Budget Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && resetBudgets()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card-premium p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentBudget ? 'Edit Budget' : 'Create Budget'} - {
                    new Date(selectedMonth + '-01').toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })
                  }
                </h3>
                <button
                  onClick={resetBudgets}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((category) => (
                    <Input
                      key={category}
                      label={category}
                      type="number"
                      step="0.01"
                      value={categoryBudgets[category] || ''}
                      onChange={(e) => setCategoryBudgets(prev => ({
                        ...prev,
                        [category]: e.target.value
                      }))}
                      icon="DollarSign"
                    />
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Budget:</span>
                    <span className="text-primary-600">
                      ${getTotalBudgeted().toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="primary"
                    onClick={handleSaveBudget}
                    className="flex-1"
                  >
                    {currentBudget ? 'Update Budget' : 'Create Budget'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={resetBudgets}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Budget