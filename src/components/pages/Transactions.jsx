import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Select from "@/components/atoms/Select";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import TransactionItem from "@/components/molecules/TransactionItem";
import ExportDialog from "@/components/molecules/ExportDialog";
import SearchBar from "@/components/molecules/SearchBar";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import transactionService from "@/services/api/transactionService";

const Transactions = () => {
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterType, setFilterType] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    recurring: false
  })

  const categories = [
    'Salary', 'Freelance', 'Rent', 'Groceries', 'Utilities', 
    'Transportation', 'Entertainment', 'Healthcare', 'Shopping', 
    'Subscriptions', 'Other'
  ]

  const loadTransactions = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await transactionService.getAll()
      setTransactions(data)
      setFilteredTransactions(data)
    } catch (err) {
      setError('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [])

  useEffect(() => {
    let filtered = transactions

    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterCategory) {
      filtered = filtered.filter(transaction => transaction.category === filterCategory)
    }

    if (filterType) {
      filtered = filtered.filter(transaction => transaction.type === filterType)
    }

    setFilteredTransactions(filtered)
  }, [transactions, searchTerm, filterCategory, filterType])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.amount || !formData.category || !formData.description) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount)
      }

      if (editingTransaction) {
        await transactionService.update(editingTransaction.Id, transactionData)
        toast.success('Transaction updated successfully')
      } else {
        await transactionService.create(transactionData)
        toast.success('Transaction added successfully')
      }

      await loadTransactions()
      resetForm()
    } catch (err) {
      toast.error('Failed to save transaction')
    }
  }

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      category: transaction.category,
      description: transaction.description,
      date: transaction.date,
      recurring: transaction.recurring
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return
    }

    try {
      await transactionService.delete(id)
      toast.success('Transaction deleted successfully')
      await loadTransactions()
    } catch (err) {
      toast.error('Failed to delete transaction')
    }
  }

  const resetForm = () => {
    setFormData({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      recurring: false
    })
    setEditingTransaction(null)
    setShowForm(false)
  }

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  if (loading) return <Loading type="table" />
  if (error) return <Error message={error} onRetry={loadTransactions} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Transactions</h1>
          <p className="text-gray-600 mt-1">Track your income and expenses</p>
</div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            icon="Download"
            onClick={() => setShowExportDialog(true)}
          >
            Export
          </Button>
          
          <Button
            variant="primary"
            icon="Plus"
            onClick={() => setShowForm(true)}
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-premium p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-accent-600">
                ${totalIncome.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-accent-100 to-accent-200 rounded-xl flex items-center justify-center">
              <ApperIcon name="TrendingUp" className="w-6 h-6 text-accent-600" />
            </div>
          </div>
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                ${totalExpenses.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center">
              <ApperIcon name="TrendingDown" className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Balance</p>
              <p className={`text-2xl font-bold ${
                totalIncome - totalExpenses >= 0 ? 'text-accent-600' : 'text-red-600'
              }`}>
                ${(totalIncome - totalExpenses).toLocaleString()}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              totalIncome - totalExpenses >= 0 
                ? 'bg-gradient-to-br from-accent-100 to-accent-200'
                : 'bg-gradient-to-br from-red-100 to-red-200'
            }`}>
              <ApperIcon 
                name="DollarSign" 
                className={`w-6 h-6 ${
                  totalIncome - totalExpenses >= 0 ? 'text-accent-600' : 'text-red-600'
                }`} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-premium p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search transactions..."
          />
          
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            options={[
              { value: 'income', label: 'Income' },
              { value: 'expense', label: 'Expense' }
            ]}
            placeholder="All Types"
          />
          
          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            options={categories.map(cat => ({ value: cat, label: cat }))}
            placeholder="All Categories"
          />
          
          <Button
            variant="secondary"
            onClick={() => {
              setSearchTerm('')
              setFilterCategory('')
              setFilterType('')
            }}
            className="w-full"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card-premium p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          All Transactions ({filteredTransactions.length})
        </h3>
        
        {filteredTransactions.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredTransactions.map((transaction) => (
                <TransactionItem
                  key={transaction.Id}
                  transaction={transaction}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <Empty
            title="No transactions found"
            description="Add your first transaction or adjust your filters"
            actionText="Add Transaction"
            onAction={() => setShowForm(true)}
            icon="ArrowLeftRight"
          />
        )}
      </div>

      {/* Transaction Form Modal */}
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
                  {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Type"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    options={[
                      { value: 'income', label: 'Income' },
                      { value: 'expense', label: 'Expense' }
                    ]}
                    required
                  />
                  
                  <Input
                    label="Amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    icon="DollarSign"
                    required
                  />
                </div>

                <Select
                  label="Category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  options={categories.map(cat => ({ value: cat, label: cat }))}
                  required
                />

                <Input
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  icon="FileText"
                  required
                />

                <Input
                  label="Date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={formData.recurring}
                    onChange={(e) => setFormData(prev => ({ ...prev, recurring: e.target.checked }))}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="recurring" className="ml-2 text-sm text-gray-700">
                    Recurring transaction
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button type="submit" variant="primary" className="flex-1">
                    {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
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

      {/* Export Dialog */}
      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        exportType="transactions"
        data={{ transactions: filteredTransactions }}
        title="Export Transactions"
      />
    </div>
  )
}

export default Transactions