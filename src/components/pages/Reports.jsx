import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import ExpenseChart from '@/components/organisms/ExpenseChart'
import IncomeExpenseChart from '@/components/organisms/IncomeExpenseChart'
import Select from '@/components/atoms/Select'
import Button from '@/components/atoms/Button'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import ApperIcon from '@/components/ApperIcon'
import ExportDialog from '@/components/molecules/ExportDialog'
import transactionService from '@/services/api/transactionService'

const Reports = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dateRange, setDateRange] = useState('last-6-months')
  const [reportType, setReportType] = useState('overview')
  const [showExportDialog, setShowExportDialog] = useState(false)

  const loadTransactions = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await transactionService.getAll()
      setTransactions(data)
    } catch (err) {
      setError('Failed to load transaction data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [])

  const getFilteredTransactions = () => {
    const now = new Date()
    let startDate = new Date()

    switch (dateRange) {
      case 'last-month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'last-3-months':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'last-6-months':
        startDate.setMonth(now.getMonth() - 6)
        break
      case 'last-year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setMonth(now.getMonth() - 6)
    }

    return transactions.filter(t => new Date(t.date) >= startDate)
  }

  const getExpensesByCategory = () => {
    const filteredTransactions = getFilteredTransactions()
    const expenses = filteredTransactions.filter(t => t.type === 'expense')
    
    const categoryTotals = expenses.reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount
      return acc
    }, {})
    
    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
  }

  const getMonthlyTrends = () => {
    const filteredTransactions = getFilteredTransactions()
    const monthlyData = {}

    filteredTransactions.forEach(transaction => {
      const month = transaction.date.slice(0, 7)
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expenses: 0 }
      }
      
      if (transaction.type === 'income') {
        monthlyData[month].income += transaction.amount
      } else {
        monthlyData[month].expenses += transaction.amount
      }
    })

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        ...data
      }))
  }

  const getTopCategories = () => {
    const expenseData = getExpensesByCategory()
    return expenseData.slice(0, 5)
  }

  const getFinancialSummary = () => {
    const filteredTransactions = getFilteredTransactions()
    
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const netIncome = totalIncome - totalExpenses
    const averageMonthlyIncome = totalIncome / getMonthlyTrends().length || 0
    const averageMonthlyExpenses = totalExpenses / getMonthlyTrends().length || 0

    return {
      totalIncome,
      totalExpenses,
      netIncome,
      averageMonthlyIncome,
      averageMonthlyExpenses,
      savingsRate: totalIncome > 0 ? ((netIncome / totalIncome) * 100) : 0
    }
  }


  if (loading) return <Loading type="dashboard" />
  if (error) return <Error message={error} onRetry={loadTransactions} />

  const expenseData = getExpensesByCategory()
  const monthlyData = getMonthlyTrends()
  const topCategories = getTopCategories()
  const summary = getFinancialSummary()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Financial Reports</h1>
          <p className="text-gray-600 mt-1">Analyze your spending patterns and financial trends</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            options={[
              { value: 'last-month', label: 'Last Month' },
              { value: 'last-3-months', label: 'Last 3 Months' },
              { value: 'last-6-months', label: 'Last 6 Months' },
              { value: 'last-year', label: 'Last Year' }
            ]}
/>
          
          <Button
            variant="secondary"
            icon="Download"
            onClick={() => setShowExportDialog(true)}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-100 to-accent-200 rounded-xl flex items-center justify-center">
              <ApperIcon name="TrendingUp" className="w-6 h-6 text-accent-600" />
            </div>
            <div className={`text-sm font-medium ${
              summary.netIncome >= 0 ? 'text-accent-600' : 'text-red-600'
            }`}>
              {summary.netIncome >= 0 ? '+' : '-'}${Math.abs(summary.netIncome).toLocaleString()}
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Income</h3>
          <p className="text-2xl font-bold text-gray-900">${summary.totalIncome.toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-premium p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center">
              <ApperIcon name="TrendingDown" className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-sm font-medium text-red-600">
              -${summary.totalExpenses.toLocaleString()}
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Expenses</h3>
          <p className="text-2xl font-bold text-gray-900">${summary.totalExpenses.toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-premium p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
              <ApperIcon name="DollarSign" className="w-6 h-6 text-primary-600" />
            </div>
            <div className={`text-sm font-medium ${
              summary.netIncome >= 0 ? 'text-accent-600' : 'text-red-600'
            }`}>
              {summary.savingsRate.toFixed(1)}%
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Net Income</h3>
          <p className={`text-2xl font-bold ${
            summary.netIncome >= 0 ? 'text-accent-600' : 'text-red-600'
          }`}>
            ${Math.abs(summary.netIncome).toLocaleString()}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-premium p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-xl flex items-center justify-center">
              <ApperIcon name="PiggyBank" className="w-6 h-6 text-secondary-600" />
            </div>
            <div className="text-sm font-medium text-secondary-600">
              Monthly Avg
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Savings Rate</h3>
          <p className="text-2xl font-bold gradient-text">{summary.savingsRate.toFixed(1)}%</p>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Expense Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-premium p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Expense Breakdown</h3>
          {expenseData.length > 0 ? (
            <ExpenseChart data={expenseData} />
          ) : (
            <Empty 
              title="No expense data"
              description="No expenses found for the selected period"
              icon="PieChart"
            />
          )}
        </motion.div>

        {/* Income vs Expenses Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-premium p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Income vs Expenses Trend</h3>
          {monthlyData.length > 0 ? (
            <IncomeExpenseChart data={monthlyData} />
          ) : (
            <Empty 
              title="No trend data"
              description="No transactions found for the selected period"
              icon="BarChart3"
            />
          )}
        </motion.div>
      </div>

      {/* Top Spending Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card-premium p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Spending Categories</h3>
        
        {topCategories.length > 0 ? (
          <div className="space-y-4">
            {topCategories.map((category, index) => {
              const percentage = summary.totalExpenses > 0 ? (category.amount / summary.totalExpenses) * 100 : 0
              
              return (
                <div key={category.category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-secondary-200 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary-700">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{category.category}</h4>
                      <p className="text-sm text-gray-600">{percentage.toFixed(1)}% of total expenses</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      ${category.amount.toLocaleString()}
                    </p>
                    <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-gradient-to-r from-primary-400 to-secondary-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <Empty 
            title="No spending data"
            description="No expense categories found for the selected period"
            icon="BarChart3"
          />
        )}
      </motion.div>

      {/* Insights Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card-premium p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Financial Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-accent-100 to-accent-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <ApperIcon name="TrendingUp" className="w-4 h-4 text-accent-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Average Monthly Income</h4>
                <p className="text-gray-600 text-sm">
                  ${summary.averageMonthlyIncome.toLocaleString()} per month
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <ApperIcon name="TrendingDown" className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Average Monthly Expenses</h4>
                <p className="text-gray-600 text-sm">
                  ${summary.averageMonthlyExpenses.toLocaleString()} per month
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <ApperIcon name="Target" className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Savings Performance</h4>
                <p className="text-gray-600 text-sm">
                  {summary.savingsRate >= 20 
                    ? 'Excellent! You\'re saving above the recommended 20%'
                    : summary.savingsRate >= 10
                    ? 'Good progress, consider increasing your savings rate'
                    : 'Consider reducing expenses to increase savings'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <ApperIcon name="PieChart" className="w-4 h-4 text-secondary-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Top Expense Category</h4>
                <p className="text-gray-600 text-sm">
                  {topCategories.length > 0 
                    ? `${topCategories[0].category} accounts for ${((topCategories[0].amount / summary.totalExpenses) * 100).toFixed(1)}% of expenses`
                    : 'No expense data available'
                  }
                </p>
              </div>
            </div>
          </div>
</div>
      </motion.div>

      {/* Export Dialog */}
      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        exportType="financial-summary"
        data={{
          summary,
          categoryData: expenseData,
          monthlyData
        }}
        title="Export Financial Report"
      />
    </div>
  )
}

export default Reports