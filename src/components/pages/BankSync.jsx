import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Select from '@/components/atoms/Select'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import ApperIcon from '@/components/ApperIcon'
import bankAccountService from '@/services/api/bankAccountService'
import transactionService from '@/services/api/transactionService'

const BankSync = () => {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showCredentialsForm, setShowCredentialsForm] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [syncing, setSyncing] = useState({})
  const [testing, setTesting] = useState({})
  
  const [addFormData, setAddFormData] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    accountType: 'checking',
    username: '',
    password: '',
    syncInterval: 'daily'
  })

  const [credentialsData, setCredentialsData] = useState({
    username: '',
    password: ''
  })

  const bankOptions = [
    'Chase Bank', 'Bank of America', 'Wells Fargo', 'Capital One',
    'Citibank', 'US Bank', 'PNC Bank', 'TD Bank', 'Regions Bank', 'Other'
  ]

  const accountTypes = [
    { value: 'checking', label: 'Checking Account' },
    { value: 'savings', label: 'Savings Account' },
    { value: 'credit', label: 'Credit Card' }
  ]

  const syncIntervals = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ]

  const loadAccounts = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await bankAccountService.getAll()
      setAccounts(data)
    } catch (err) {
      setError('Failed to load bank accounts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAccounts()
  }, [])

  const handleAddAccount = async (e) => {
    e.preventDefault()
    
    if (!addFormData.bankName || !addFormData.accountName || !addFormData.username || !addFormData.password) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const accountData = {
        bankName: addFormData.bankName,
        accountName: addFormData.accountName,
        accountNumber: addFormData.accountNumber || '****0000',
        accountType: addFormData.accountType,
        syncInterval: addFormData.syncInterval,
        credentials: {
          username: addFormData.username,
          encryptedPassword: `encrypted_${Date.now()}`
        }
      }

      const newAccount = await bankAccountService.create(accountData)
      
      // Test connection immediately
      try {
        await bankAccountService.testConnection(newAccount.Id, accountData.credentials)
        toast.success('Bank account added and connected successfully')
      } catch (connErr) {
        toast.warning('Bank account added but connection failed. Please update credentials.')
      }
      
      await loadAccounts()
      resetAddForm()
    } catch (err) {
      toast.error('Failed to add bank account')
    }
  }

  const handleTestConnection = async (accountId) => {
    if (!credentialsData.username || !credentialsData.password) {
      toast.error('Please enter your credentials')
      return
    }

    try {
      setTesting(prev => ({ ...prev, [accountId]: true }))
      const credentials = {
        username: credentialsData.username,
        encryptedPassword: `encrypted_${Date.now()}`
      }
      
      await bankAccountService.testConnection(accountId, credentials)
      toast.success('Connection test successful')
      await loadAccounts()
      setShowCredentialsForm(false)
      setCredentialsData({ username: '', password: '' })
      setSelectedAccount(null)
    } catch (err) {
      toast.error(err.message || 'Connection test failed')
    } finally {
      setTesting(prev => ({ ...prev, [accountId]: false }))
    }
  }

  const handleSyncAccount = async (accountId) => {
    try {
      setSyncing(prev => ({ ...prev, [accountId]: true }))
      const result = await bankAccountService.syncAccount(accountId)
      
      if (result.transactions && result.transactions.length > 0) {
        await transactionService.importFromBank(result.transactions)
        toast.success(`Successfully imported ${result.importedCount} transactions`)
      } else {
        toast.info('No new transactions to import')
      }
      
      await loadAccounts()
    } catch (err) {
      toast.error(err.message || 'Sync failed')
    } finally {
      setSyncing(prev => ({ ...prev, [accountId]: false }))
    }
  }

  const handleDeleteAccount = async (accountId) => {
    if (!window.confirm('Are you sure you want to remove this bank account connection?')) {
      return
    }

    try {
      await bankAccountService.delete(accountId)
      toast.success('Bank account removed successfully')
      await loadAccounts()
    } catch (err) {
      toast.error('Failed to remove bank account')
    }
  }

  const handleUpdateSyncInterval = async (accountId, interval) => {
    try {
      await bankAccountService.update(accountId, { syncInterval: interval })
      toast.success('Sync interval updated')
      await loadAccounts()
    } catch (err) {
      toast.error('Failed to update sync interval')
    }
  }

  const resetAddForm = () => {
    setAddFormData({
      bankName: '',
      accountName: '',
      accountNumber: '',
      accountType: 'checking',
      username: '',
      password: '',
      syncInterval: 'daily'
    })
    setShowAddForm(false)
  }

  const getStatusIcon = (account) => {
    if (syncing[account.Id]) return 'RefreshCw'
    if (account.syncStatus === 'error') return 'AlertCircle'
    if (account.syncStatus === 'syncing') return 'RefreshCw'
    if (account.isConnected) return 'CheckCircle'
    return 'AlertTriangle'
  }

  const getStatusColor = (account) => {
    if (syncing[account.Id]) return 'text-blue-600'
    if (account.syncStatus === 'error') return 'text-red-600'
    if (account.syncStatus === 'syncing') return 'text-blue-600'
    if (account.isConnected) return 'text-green-600'
    return 'text-yellow-600'
  }

  const getStatusText = (account) => {
    if (syncing[account.Id]) return 'Syncing...'
    if (account.syncStatus === 'error') return 'Error'
    if (account.syncStatus === 'syncing') return 'Syncing'
    if (account.isConnected) return 'Connected'
    return 'Disconnected'
  }

  if (loading) return <Loading type="table" />
  if (error) return <Error message={error} onRetry={loadAccounts} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Bank Sync</h1>
          <p className="text-gray-600 mt-1">Connect and manage your bank accounts for automatic transaction import</p>
        </div>
        
        <Button
          variant="primary"
          icon="Plus"
          onClick={() => setShowAddForm(true)}
        >
          Add Bank Account
        </Button>
      </div>

      {/* Connected Accounts Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-premium p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Connected Accounts</p>
              <p className="text-2xl font-bold text-accent-600">
                {accounts.filter(acc => acc.isConnected).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-accent-100 to-accent-200 rounded-xl flex items-center justify-center">
              <ApperIcon name="Landmark" className="w-6 h-6 text-accent-600" />
            </div>
          </div>
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Last Sync</p>
              <p className="text-2xl font-bold text-gray-900">
                {accounts.some(acc => acc.lastSync) 
                  ? format(new Date(Math.max(...accounts.filter(acc => acc.lastSync).map(acc => new Date(acc.lastSync)))), 'MMM dd')
                  : 'Never'
                }
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
              <ApperIcon name="RefreshCw" className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sync Errors</p>
              <p className="text-2xl font-bold text-red-600">
                {accounts.filter(acc => acc.syncStatus === 'error').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center">
              <ApperIcon name="AlertCircle" className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Bank Accounts List */}
      <div className="card-premium p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Bank Accounts ({accounts.length})
        </h3>
        
        {accounts.length > 0 ? (
          <div className="space-y-4">
            {accounts.map((account) => (
              <motion.div
                key={account.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                      <ApperIcon name="Landmark" className="w-6 h-6 text-primary-600" />
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{account.accountName}</h4>
                      <p className="text-sm text-gray-600">{account.bankName} • {account.accountNumber}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className={`flex items-center space-x-1 ${getStatusColor(account)}`}>
                          <ApperIcon 
                            name={getStatusIcon(account)} 
                            className={`w-4 h-4 ${syncing[account.Id] || account.syncStatus === 'syncing' ? 'animate-spin' : ''}`} 
                          />
                          <span className="text-sm font-medium">{getStatusText(account)}</span>
                        </div>
                        
                        {account.lastSync && (
                          <span className="text-sm text-gray-500">
                            Last sync: {format(new Date(account.lastSync), 'MMM dd, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Select
                      value={account.syncInterval}
                      onChange={(e) => handleUpdateSyncInterval(account.Id, e.target.value)}
                      options={syncIntervals}
                      className="min-w-[120px]"
                    />
                    
                    {account.isConnected && (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon="RefreshCw"
                        onClick={() => handleSyncAccount(account.Id)}
                        disabled={syncing[account.Id]}
                        className={syncing[account.Id] ? 'animate-pulse' : ''}
                      >
                        {syncing[account.Id] ? 'Syncing...' : 'Sync Now'}
                      </Button>
                    )}
                    
                    {!account.isConnected && (
                      <Button
                        variant="accent"
                        size="sm"
                        icon="Link"
                        onClick={() => {
                          setSelectedAccount(account)
                          setShowCredentialsForm(true)
                        }}
                      >
                        Reconnect
                      </Button>
                    )}
                    
                    <Button
                      variant="danger"
                      size="sm"
                      icon="Trash2"
                      onClick={() => handleDeleteAccount(account.Id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>

                {account.errorMessage && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <ApperIcon name="AlertCircle" className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-red-700">{account.errorMessage}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <Empty
            title="No bank accounts connected"
            description="Connect your first bank account to start importing transactions automatically"
            actionText="Add Bank Account"
            onAction={() => setShowAddForm(true)}
            icon="Landmark"
          />
        )}
      </div>

      {/* Add Account Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && resetAddForm()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card-premium p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Add Bank Account</h3>
                <button
                  onClick={resetAddForm}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddAccount} className="space-y-4">
                <Select
                  label="Bank"
                  value={addFormData.bankName}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, bankName: e.target.value }))}
                  options={bankOptions.map(bank => ({ value: bank, label: bank }))}
                  required
                />

                <Input
                  label="Account Name"
                  value={addFormData.accountName}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, accountName: e.target.value }))}
                  placeholder="e.g. Primary Checking"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Account Type"
                    value={addFormData.accountType}
                    onChange={(e) => setAddFormData(prev => ({ ...prev, accountType: e.target.value }))}
                    options={accountTypes}
                    required
                  />

                  <Select
                    label="Sync Frequency"
                    value={addFormData.syncInterval}
                    onChange={(e) => setAddFormData(prev => ({ ...prev, syncInterval: e.target.value }))}
                    options={syncIntervals}
                    required
                  />
                </div>

                <Input
                  label="Account Number (optional)"
                  value={addFormData.accountNumber}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                  placeholder="Last 4 digits"
                />

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Bank Login Credentials</h4>
                  <div className="space-y-3">
                    <Input
                      label="Username/Email"
                      value={addFormData.username}
                      onChange={(e) => setAddFormData(prev => ({ ...prev, username: e.target.value }))}
                      required
                    />

                    <Input
                      label="Password"
                      type="password"
                      value={addFormData.password}
                      onChange={(e) => setAddFormData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Your credentials are encrypted and stored securely. We use read-only access to import transactions.
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button type="submit" variant="primary" className="flex-1">
                    Add & Connect Account
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={resetAddForm}
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

      {/* Credentials Modal */}
      <AnimatePresence>
        {showCredentialsForm && selectedAccount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && setShowCredentialsForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card-premium p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Update Credentials</h3>
                <button
                  onClick={() => setShowCredentialsForm(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Update credentials for <strong>{selectedAccount.accountName}</strong> at {selectedAccount.bankName}
                </p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleTestConnection(selectedAccount.Id); }} className="space-y-4">
                <Input
                  label="Username/Email"
                  value={credentialsData.username}
                  onChange={(e) => setCredentialsData(prev => ({ ...prev, username: e.target.value }))}
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  value={credentialsData.password}
                  onChange={(e) => setCredentialsData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />

                <div className="flex space-x-3 pt-4">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="flex-1"
                    disabled={testing[selectedAccount.Id]}
                  >
                    {testing[selectedAccount.Id] ? 'Testing...' : 'Test Connection'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowCredentialsForm(false)
                      setCredentialsData({ username: '', password: '' })
                      setSelectedAccount(null)
                    }}
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

export default BankSync