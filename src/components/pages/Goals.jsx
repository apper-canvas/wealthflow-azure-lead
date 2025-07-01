import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import GoalCard from '@/components/molecules/GoalCard'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import ApperIcon from '@/components/ApperIcon'
import goalService from '@/services/api/goalService'

const Goals = () => {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showContributionForm, setShowContributionForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [contributionAmount, setContributionAmount] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: ''
  })

  const loadGoals = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await goalService.getAll()
      setGoals(data)
    } catch (err) {
      setError('Failed to load goals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGoals()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.targetAmount || !formData.targetDate) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const goalData = {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount) || 0
      }

      if (editingGoal) {
        await goalService.update(editingGoal.Id, goalData)
        toast.success('Goal updated successfully')
      } else {
        await goalService.create(goalData)
        toast.success('Goal created successfully')
      }

      await loadGoals()
      resetForm()
    } catch (err) {
      toast.error('Failed to save goal')
    }
  }

  const handleEdit = (goal) => {
    setEditingGoal(goal)
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      targetDate: goal.targetDate
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) {
      return
    }

    try {
      await goalService.delete(id)
      toast.success('Goal deleted successfully')
      await loadGoals()
    } catch (err) {
      toast.error('Failed to delete goal')
    }
  }

  const handleContribute = (goal) => {
    setSelectedGoal(goal)
    setContributionAmount('')
    setShowContributionForm(true)
  }

  const handleContributionSubmit = async (e) => {
    e.preventDefault()
    
    const amount = parseFloat(contributionAmount)
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid contribution amount')
      return
    }

    try {
      await goalService.addContribution(selectedGoal.Id, amount)
      toast.success('Contribution added successfully')
      await loadGoals()
      setShowContributionForm(false)
      setSelectedGoal(null)
      setContributionAmount('')
    } catch (err) {
      toast.error('Failed to add contribution')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      targetAmount: '',
      currentAmount: '',
      targetDate: ''
    })
    setEditingGoal(null)
    setShowForm(false)
  }

  const getTotalSavings = () => {
    return goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  }

  const getTotalTargets = () => {
    return goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  }

  const getCompletedGoals = () => {
    return goals.filter(goal => goal.currentAmount >= goal.targetAmount).length
  }

  const getOverallProgress = () => {
    const totalTargets = getTotalTargets()
    const totalSavings = getTotalSavings()
    return totalTargets > 0 ? (totalSavings / totalTargets) * 100 : 0
  }

  if (loading) return <Loading type="cards" />
  if (error) return <Error message={error} onRetry={loadGoals} />

  const totalSavings = getTotalSavings()
  const totalTargets = getTotalTargets()
  const completedGoals = getCompletedGoals()
  const overallProgress = getOverallProgress()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Savings Goals</h1>
          <p className="text-gray-600 mt-1">Track your progress towards financial milestones</p>
        </div>
        
        <Button
          variant="primary"
          icon="Plus"
          onClick={() => setShowForm(true)}
        >
          Add Goal
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-100 to-accent-200 rounded-xl flex items-center justify-center">
              <ApperIcon name="PiggyBank" className="w-6 h-6 text-accent-600" />
            </div>
            <div className="text-sm font-medium text-accent-600">
              {Math.round(overallProgress)}%
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Saved</h3>
          <p className="text-2xl font-bold text-gray-900">${totalSavings.toLocaleString()}</p>
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
              <ApperIcon name="Target" className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Target Amount</h3>
          <p className="text-2xl font-bold text-gray-900">${totalTargets.toLocaleString()}</p>
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-xl flex items-center justify-center">
              <ApperIcon name="Trophy" className="w-6 h-6 text-secondary-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Completed Goals</h3>
          <p className="text-2xl font-bold text-gray-900">{completedGoals}</p>
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center">
              <ApperIcon name="Clock" className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Active Goals</h3>
          <p className="text-2xl font-bold text-gray-900">{goals.length - completedGoals}</p>
        </div>
      </div>

      {/* Goals Grid */}
      {goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {goals.map((goal) => (
              <GoalCard
                key={goal.Id}
                goal={goal}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onContribute={handleContribute}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Empty
          title="No savings goals yet"
          description="Start by creating your first savings goal to track your progress"
          actionText="Add Goal"
          onAction={() => setShowForm(true)}
          icon="Target"
        />
      )}

      {/* Goal Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && resetForm()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card-premium p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingGoal ? 'Edit Goal' : 'Add Goal'}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Goal Name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  icon="Target"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Target Amount"
                    type="number"
                    step="0.01"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                    icon="DollarSign"
                    required
                  />
                  
                  <Input
                    label="Current Amount"
                    type="number"
                    step="0.01"
                    value={formData.currentAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentAmount: e.target.value }))}
                    icon="PiggyBank"
                  />
                </div>

                <Input
                  label="Target Date"
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                  required
                />

                <div className="flex space-x-3 pt-4">
                  <Button type="submit" variant="primary" className="flex-1">
                    {editingGoal ? 'Update Goal' : 'Add Goal'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={resetForm}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contribution Form Modal */}
      <AnimatePresence>
        {showContributionForm && selectedGoal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && setShowContributionForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card-premium p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Add Contribution
                </h3>
                <button
                  onClick={() => setShowContributionForm(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedGoal.name}
                  </h4>
                  <p className="text-gray-600">
                    Current: ${selectedGoal.currentAmount.toLocaleString()} / ${selectedGoal.targetAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              <form onSubmit={handleContributionSubmit} className="space-y-4">
                <Input
                  label="Contribution Amount"
                  type="number"
                  step="0.01"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  icon="DollarSign"
                  required
                />

                <div className="flex space-x-3 pt-4">
                  <Button type="submit" variant="primary" className="flex-1">
                    Add Contribution
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowContributionForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Goals