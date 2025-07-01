import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { format, isAfter, isBefore, addDays } from 'date-fns'
import BillItem from '@/components/molecules/BillItem'
import SearchBar from '@/components/molecules/SearchBar'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Select from '@/components/atoms/Select'
import Badge from '@/components/atoms/Badge'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import ApperIcon from '@/components/ApperIcon'
import billService from '@/services/api/billService'

const Bills = () => {
  const [bills, setBills] = useState([])
  const [filteredBills, setFilteredBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingBill, setEditingBill] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDate: '',
    recurring: false
  })

  const loadBills = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await billService.getAll()
      setBills(data)
      setFilteredBills(data)
    } catch (err) {
      setError('Failed to load bills')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBills()
  }, [])

  useEffect(() => {
    let filtered = bills

    if (searchTerm) {
      filtered = filtered.filter(bill =>
        bill.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterStatus) {
      const today = new Date()
      
      filtered = filtered.filter(bill => {
        const dueDate = new Date(bill.dueDate)
        const isOverdue = bill.status === 'pending' && isBefore(dueDate, today)
        const isDueSoon = bill.status === 'pending' && isAfter(dueDate, today) && isBefore(dueDate, addDays(today, 3))
        
        switch (filterStatus) {
          case 'paid':
            return bill.status === 'paid'
          case 'pending':
            return bill.status === 'pending' && !isOverdue && !isDueSoon
          case 'overdue':
            return bill.status === 'overdue' || isOverdue
          case 'due-soon':
            return isDueSoon
          default:
            return true
        }
      })
    }

    setFilteredBills(filtered)
  }, [bills, searchTerm, filterStatus])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.amount || !formData.dueDate) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const billData = {
        ...formData,
        amount: parseFloat(formData.amount),
        status: 'pending'
      }

      if (editingBill) {
        await billService.update(editingBill.Id, billData)
        toast.success('Bill updated successfully')
      } else {
        await billService.create(billData)
        toast.success('Bill added successfully')
      }

      await loadBills()
      resetForm()
    } catch (err) {
      toast.error('Failed to save bill')
    }
  }

  const handleEdit = (bill) => {
    setEditingBill(bill)
    setFormData({
      name: bill.name,
      amount: bill.amount.toString(),
      dueDate: bill.dueDate,
      recurring: bill.recurring
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bill?')) {
      return
    }

    try {
      await billService.delete(id)
      toast.success('Bill deleted successfully')
      await loadBills()
    } catch (err) {
      toast.error('Failed to delete bill')
    }
  }

  const handleMarkPaid = async (id) => {
    try {
      await billService.markAsPaid(id)
      toast.success('Bill marked as paid')
      await loadBills()
    } catch (err) {
      toast.error('Failed to mark bill as paid')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      dueDate: '',
      recurring: false
    })
    setEditingBill(null)
    setShowForm(false)
  }

  const getBillStats = () => {
    const today = new Date()
    
    const stats = {
      total: bills.length,
      paid: 0,
      pending: 0,
      overdue: 0,
      dueSoon: 0,
      totalAmount: 0
    }

    bills.forEach(bill => {
      const dueDate = new Date(bill.dueDate)
      const isOverdue = bill.status === 'pending' && isBefore(dueDate, today)
      const isDueSoon = bill.status === 'pending' && isAfter(dueDate, today) && isBefore(dueDate, addDays(today, 3))

      if (bill.status === 'paid') {
        stats.paid++
      } else if (isOverdue || bill.status === 'overdue') {
        stats.overdue++
      } else if (isDueSoon) {
        stats.dueSoon++
      } else if (bill.status === 'pending') {
        stats.pending++
      }

      if (bill.status === 'pending') {
        stats.totalAmount += bill.amount
      }
    })

    return stats
  }

  if (loading) return <Loading type="table" />
  if (error) return <Error message={error} onRetry={loadBills} />

  const stats = getBillStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Bills</h1>
          <p className="text-gray-600 mt-1">Track and manage your bill payments</p>
        </div>
        
        <Button
          variant="primary"
          icon="Plus"
          onClick={() => setShowForm(true)}
        >
          Add Bill
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card-premium p-4">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Total Bills</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>

        <div className="card-premium p-4">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Paid</p>
            <p className="text-2xl font-bold text-accent-600">{stats.paid}</p>
          </div>
        </div>

        <div className="card-premium p-4">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
          </div>
        </div>

        <div className="card-premium p-4">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Due Soon</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.dueSoon}</p>
          </div>
        </div>

        <div className="card-premium p-4">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Overdue</p>
            <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
          </div>
        </div>
      </div>

      {/* Outstanding Bills Alert */}
      {stats.totalAmount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-6 bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-secondary-200 rounded-xl flex items-center justify-center mr-4">
                <ApperIcon name="AlertCircle" className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Outstanding Bills</h3>
                <p className="text-gray-600">You have pending bills totaling ${stats.totalAmount.toLocaleString()}</p>
              </div>
            </div>
            {stats.overdue > 0 && (
              <Badge variant="danger" size="lg">
                {stats.overdue} Overdue
              </Badge>
            )}
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="card-premium p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search bills..."
          />
          
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: 'paid', label: 'Paid' },
              { value: 'pending', label: 'Pending' },
              { value: 'overdue', label: 'Overdue' },
              { value: 'due-soon', label: 'Due Soon' }
            ]}
            placeholder="All Status"
          />
          
          <Button
            variant="secondary"
            onClick={() => {
              setSearchTerm('')
              setFilterStatus('')
            }}
            className="w-full"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Bills List */}
      <div className="card-premium p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          All Bills ({filteredBills.length})
        </h3>
        
        {filteredBills.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredBills.map((bill) => (
                <BillItem
                  key={bill.Id}
                  bill={bill}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onMarkPaid={handleMarkPaid}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <Empty
            title="No bills found"
            description="Add your first bill or adjust your filters"
            actionText="Add Bill"
            onAction={() => setShowForm(true)}
            icon="FileText"
          />
        )}
      </div>

      {/* Bill Form Modal */}
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
                  {editingBill ? 'Edit Bill' : 'Add Bill'}
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
                  label="Bill Name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  icon="FileText"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    icon="DollarSign"
                    required
                  />
                  
                  <Input
                    label="Due Date"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={formData.recurring}
                    onChange={(e) => setFormData(prev => ({ ...prev, recurring: e.target.checked }))}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="recurring" className="ml-2 text-sm text-gray-700">
                    Recurring bill
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button type="submit" variant="primary" className="flex-1">
                    {editingBill ? 'Update Bill' : 'Add Bill'}
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
    </div>
  )
}

export default Bills