import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import MetricCard from '@/components/molecules/MetricCard'
import TransactionItem from '@/components/molecules/TransactionItem'
import ExpenseChart from '@/components/organisms/ExpenseChart'
import IncomeExpenseChart from '@/components/organisms/IncomeExpenseChart'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import ApperIcon from '@/components/ApperIcon'
import transactionService from '@/services/api/transactionService'
import billService from '@/services/api/billService'
import goalService from '@/services/api/goalService'

const Dashboard = () => {
  const [transactions, setTransactions] = useState([])
  const [upcomingBills, setUpcomingBills] = useState([])
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const [transactionsData, billsData, goalsData] = await Promise.all([
        transactionService.getAll(),
        billService.getUpcoming(7),
        goalService.getAll()
      ])
      
      setTransactions(transactionsData.slice(0, 5))
      setUpcomingBills(billsData.slice(0, 3))
      setGoals(goalsData)
    } catch (err) {
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const calculateMetrics = () => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    const currentMonthTransactions = transactions.filter(t => 
      t.date.startsWith(currentMonth)
    )
    
    const totalIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const balance = totalIncome - totalExpenses
    
    const totalSavings = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
    
    return { totalIncome, totalExpenses, balance, totalSavings }
  }

  const getExpensesByCategory = () => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    const expenses = transactions.filter(t => 
      t.type === 'expense' && t.date.startsWith(currentMonth)
    )
    
    const categoryTotals = expenses.reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount
      return acc
    }, {})
    
    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount
    }))
  }

  const getMonthlyTrends = () => {
    const months = ['2024-01', '2024-02']
    
    return months.map(month => {
      const monthTransactions = transactions.filter(t => t.date.startsWith(month))
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
      
      return {
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        income,
        expenses
      }
    })
  }

  if (loading) return <Loading type="dashboard" />
  if (error) return <Error message={error} onRetry={loadData} />

  const metrics = calculateMetrics()
  const expenseData = getExpensesByCategory()
  const monthlyData = getMonthlyTrends()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your financial overview.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <ApperIcon name="Calendar" className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}</span>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Balance"
          value={`$${metrics.balance.toLocaleString()}`}
          change="+2.5%"
          icon="DollarSign"
          trend={metrics.balance >= 0 ? 'up' : 'down'}
        />
        <MetricCard
          title="Monthly Income"
          value={`$${metrics.totalIncome.toLocaleString()}`}
          change="+5.2%"
          icon="TrendingUp"
          trend="up"
        />
        <MetricCard
          title="Monthly Expenses"
          value={`$${metrics.totalExpenses.toLocaleString()}`}
          change="-1.8%"
          icon="TrendingDown"
          trend="down"
        />
        <MetricCard
          title="Total Savings"
          value={`$${metrics.totalSavings.toLocaleString()}`}
          change="+8.1%"
          icon="PiggyBank"
          trend="up"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Expense Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-premium p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Expense Breakdown</h3>
          {expenseData.length > 0 ? (
            <ExpenseChart data={expenseData} />
          ) : (
            <Empty 
              title="No expenses yet"
              description="Start tracking your expenses to see the breakdown"
              icon="PieChart"
            />
          )}
        </motion.div>

        {/* Income vs Expenses Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-premium p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Income vs Expenses</h3>
          <IncomeExpenseChart data={monthlyData} />
        </motion.div>
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 card-premium p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </button>
          </div>
          
          {transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <TransactionItem
                  key={transaction.Id}
                  transaction={transaction}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              ))}
            </div>
          ) : (
            <Empty 
              title="No transactions yet"
              description="Start by adding your first transaction"
              icon="ArrowLeftRight"
            />
          )}
        </motion.div>

        {/* Upcoming Bills & Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          {/* Upcoming Bills */}
          <div className="card-premium p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Bills</h3>
            {upcomingBills.length > 0 ? (
              <div className="space-y-3">
                {upcomingBills.map((bill) => (
                  <div key={bill.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{bill.name}</p>
                      <p className="text-sm text-gray-600">
                        Due: {new Date(bill.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      ${bill.amount}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">No upcoming bills</p>
            )}
          </div>

          {/* Goal Progress */}
          <div className="card-premium p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Goal Progress</h3>
            {goals.length > 0 ? (
              <div className="space-y-4">
                {goals.slice(0, 2).map((goal) => {
                  const progress = (goal.currentAmount / goal.targetAmount) * 100
                  return (
                    <div key={goal.Id}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-gray-900">{goal.name}</span>
                        <span className="text-gray-600">{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-primary-400 to-secondary-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">No active goals</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard