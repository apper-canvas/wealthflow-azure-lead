import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import ApperIcon from '@/components/ApperIcon'
import Select from '@/components/atoms/Select'
import Button from '@/components/atoms/Button'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'

const BudgetVarianceAnalysis = ({ budgets, transactions, selectedMonth, loading, error }) => {
  const [viewMode, setViewMode] = useState('current') // 'current', 'comparison', 'trend'
  const [varianceThreshold, setVarianceThreshold] = useState('all') // 'all', 'over', 'under', 'warning'
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    'Rent', 'Groceries', 'Utilities', 'Transportation', 
    'Entertainment', 'Healthcare', 'Shopping', 'Subscriptions'
  ]

  const currentBudget = useMemo(() => 
    budgets.find(b => b.month === selectedMonth), 
    [budgets, selectedMonth]
  )

  const getSpentAmount = (category, month = selectedMonth) => {
    return transactions
      .filter(t => 
        t.type === 'expense' && 
        t.category === category && 
        t.date.startsWith(month)
      )
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const calculateVarianceData = useMemo(() => {
    if (!currentBudget) return []
    
    return categories
      .filter(cat => currentBudget.categories[cat] > 0)
      .map(category => {
        const budgeted = currentBudget.categories[category] || 0
        const actual = getSpentAmount(category)
        const variance = actual - budgeted
        const variancePercent = budgeted > 0 ? (variance / budgeted) * 100 : 0
        
        return {
          category,
          budgeted,
          actual,
          variance,
          variancePercent,
          isOverBudget: variance > 0,
          isNearLimit: variancePercent > -20 && variancePercent <= 0,
          status: variance > 0 ? 'over' : variancePercent > -20 ? 'warning' : 'under'
        }
      })
      .filter(item => {
        if (selectedCategory !== 'all' && item.category !== selectedCategory) return false
        if (varianceThreshold === 'over') return item.isOverBudget
        if (varianceThreshold === 'under') return !item.isOverBudget && !item.isNearLimit
        if (varianceThreshold === 'warning') return item.isNearLimit
        return true
      })
  }, [currentBudget, transactions, selectedMonth, selectedCategory, varianceThreshold])

  const comparisonData = useMemo(() => {
    if (viewMode !== 'comparison') return []
    
    const previousMonth = new Date(selectedMonth + '-01')
    previousMonth.setMonth(previousMonth.getMonth() - 1)
    const prevMonthStr = previousMonth.toISOString().slice(0, 7)
    
    const prevBudget = budgets.find(b => b.month === prevMonthStr)
    if (!prevBudget || !currentBudget) return []
    
    return categories
      .filter(cat => currentBudget.categories[cat] > 0 || prevBudget.categories[cat] > 0)
      .map(category => {
        const currentBudgeted = currentBudget.categories[category] || 0
        const currentActual = getSpentAmount(category, selectedMonth)
        const prevBudgeted = prevBudget.categories[category] || 0
        const prevActual = getSpentAmount(category, prevMonthStr)
        
        return {
          category,
          currentBudgeted,
          currentActual,
          prevBudgeted,
          prevActual,
          budgetChange: currentBudgeted - prevBudgeted,
          spendingChange: currentActual - prevActual
        }
      })
  }, [budgets, transactions, selectedMonth, currentBudget, viewMode])

  const getStatusColor = (status) => {
    switch (status) {
      case 'over': return '#ef4444'
      case 'warning': return '#f59e0b'
      case 'under': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getInsights = () => {
    if (!calculateVarianceData.length) return []
    
    const insights = []
    const overBudgetItems = calculateVarianceData.filter(item => item.isOverBudget)
    const underBudgetItems = calculateVarianceData.filter(item => !item.isOverBudget && !item.isNearLimit)
    const warningItems = calculateVarianceData.filter(item => item.isNearLimit)
    
    if (overBudgetItems.length > 0) {
      const totalOverspend = overBudgetItems.reduce((sum, item) => sum + item.variance, 0)
      insights.push({
        type: 'warning',
        title: 'Budget Exceeded',
        description: `${overBudgetItems.length} categories over budget by $${totalOverspend.toLocaleString()} total`,
        icon: 'AlertTriangle'
      })
    }
    
    if (warningItems.length > 0) {
      insights.push({
        type: 'info',
        title: 'Approaching Limits',
        description: `${warningItems.length} categories within 20% of budget limit`,
        icon: 'AlertCircle'
      })
    }
    
    if (underBudgetItems.length > 0) {
      const totalSavings = underBudgetItems.reduce((sum, item) => sum + Math.abs(item.variance), 0)
      insights.push({
        type: 'success',
        title: 'Budget Savings',
        description: `$${totalSavings.toLocaleString()} saved across ${underBudgetItems.length} categories`,
        icon: 'TrendingUp'
      })
    }
    
    return insights
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600">{entry.dataKey}:</span>
              <span className="text-sm font-medium">${entry.value?.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) return <Loading type="cards" />
  if (error) return <Error message={error} />
  if (!currentBudget) return null

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="card-premium p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Budget Variance Analysis</h2>
            <p className="text-gray-600">Compare budgeted amounts with actual spending</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              options={[
                { value: 'current', label: 'Current Month' },
                { value: 'comparison', label: 'Month Comparison' },
                { value: 'trend', label: 'Trend Analysis' }
              ]}
            />
            
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={[
                { value: 'all', label: 'All Categories' },
                ...categories.map(cat => ({ value: cat, label: cat }))
              ]}
            />
            
            <Select
              value={varianceThreshold}
              onChange={(e) => setVarianceThreshold(e.target.value)}
              options={[
                { value: 'all', label: 'All Items' },
                { value: 'over', label: 'Over Budget' },
                { value: 'warning', label: 'Near Limit' },
                { value: 'under', label: 'Under Budget' }
              ]}
            />
          </div>
        </div>

        {/* Variance Chart */}
        {calculateVarianceData.length > 0 ? (
          <div className="h-80 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={calculateVarianceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="category" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="budgeted" name="Budgeted" fill="#3b82f6" opacity={0.8} />
                <Bar dataKey="actual" name="Actual" fill="#ef4444" opacity={0.8} />
                <Line 
                  type="monotone" 
                  dataKey="variancePercent" 
                  name="Variance %" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <Empty
            title="No variance data available"
            description="Set up budgets for categories to see variance analysis"
            icon="BarChart3"
          />
        )}

        {/* Insights */}
        {getInsights().length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {getInsights().map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'warning' 
                    ? 'bg-red-50 border-red-400'
                    : insight.type === 'info'
                    ? 'bg-yellow-50 border-yellow-400'
                    : 'bg-green-50 border-green-400'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <ApperIcon 
                    name={insight.icon} 
                    className={`w-5 h-5 mt-0.5 ${
                      insight.type === 'warning' 
                        ? 'text-red-600'
                        : insight.type === 'info'
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{insight.title}</h4>
                    <p className="text-gray-600 text-sm mt-1">{insight.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Variance Breakdown */}
      {calculateVarianceData.length > 0 && (
        <div className="card-premium p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Variance Breakdown</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {calculateVarianceData.map((item) => (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{item.category}</h4>
                  <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                    item.status === 'over' 
                      ? 'bg-red-100 text-red-700'
                      : item.status === 'warning'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {item.status === 'over' ? 'Over' : item.status === 'warning' ? 'Warning' : 'Under'}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Budgeted:</span>
                    <span className="font-medium">${item.budgeted.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Actual:</span>
                    <span className="font-medium">${item.actual.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600">Variance:</span>
                    <span className={`font-medium ${
                      item.variance > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {item.variance > 0 ? '+' : ''}${item.variance.toLocaleString()} 
                      ({item.variancePercent > 0 ? '+' : ''}{item.variancePercent.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        item.isOverBudget
                          ? 'bg-gradient-to-r from-red-400 to-red-500'
                          : item.isNearLimit
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                          : 'bg-gradient-to-r from-green-400 to-green-500'
                      }`}
                      style={{ 
                        width: `${Math.min((item.actual / item.budgeted) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Month Comparison View */}
      {viewMode === 'comparison' && comparisonData.length > 0 && (
        <div className="card-premium p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Month-over-Month Comparison</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="category" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="prevActual" name="Previous Month" fill="#94a3b8" opacity={0.7} />
                <Bar dataKey="currentActual" name="Current Month" fill="#3b82f6" opacity={0.8} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

export default BudgetVarianceAnalysis