import bankAccountsData from '../mockData/bankAccounts.json'

let bankAccounts = [...bankAccountsData]

const bankAccountService = {
  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300))
    return [...bankAccounts].sort((a, b) => a.bankName.localeCompare(b.bankName))
  },

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    const account = bankAccounts.find(account => account.Id === parseInt(id))
    if (!account) {
      throw new Error('Bank account not found')
    }
    return { ...account }
  },

  async create(accountData) {
    await new Promise(resolve => setTimeout(resolve, 500))
    const maxId = Math.max(...bankAccounts.map(acc => acc.Id), 0)
    const newAccount = {
      ...accountData,
      Id: maxId + 1,
      isConnected: false,
      lastSync: null,
      syncStatus: 'pending',
      autoSync: false,
      errorMessage: null,
      syncSettings: {
        importCategories: true,
        importPending: false,
        dateRange: 30,
        ...accountData.syncSettings
      }
    }
    bankAccounts.push(newAccount)
    return { ...newAccount }
  },

  async update(id, accountData) {
    await new Promise(resolve => setTimeout(resolve, 400))
    const index = bankAccounts.findIndex(account => account.Id === parseInt(id))
    if (index === -1) {
      throw new Error('Bank account not found')
    }
    
    bankAccounts[index] = { 
      ...bankAccounts[index], 
      ...accountData,
      Id: bankAccounts[index].Id // Preserve ID
    }
    return { ...bankAccounts[index] }
  },

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const index = bankAccounts.findIndex(account => account.Id === parseInt(id))
    if (index === -1) {
      throw new Error('Bank account not found')
    }
    
    const deleted = bankAccounts.splice(index, 1)[0]
    return { ...deleted }
  },

  async testConnection(id, credentials) {
    await new Promise(resolve => setTimeout(resolve, 2000))
    // Simulate connection test
    const account = bankAccounts.find(acc => acc.Id === parseInt(id))
    if (!account) {
      throw new Error('Bank account not found')
    }

    // Simulate random connection results for demo
    const isSuccess = Math.random() > 0.3
    
    if (isSuccess) {
      const index = bankAccounts.findIndex(acc => acc.Id === parseInt(id))
      bankAccounts[index] = {
        ...bankAccounts[index],
        isConnected: true,
        syncStatus: 'success',
        errorMessage: null,
        credentials: credentials
      }
      return { success: true, message: 'Connection successful' }
    } else {
      const index = bankAccounts.findIndex(acc => acc.Id === parseInt(id))
      bankAccounts[index] = {
        ...bankAccounts[index],
        isConnected: false,
        syncStatus: 'error',
        errorMessage: 'Invalid credentials or bank service unavailable'
      }
      throw new Error('Connection failed. Please check your credentials.')
    }
  },

  async syncAccount(id) {
    await new Promise(resolve => setTimeout(resolve, 3000))
    const account = bankAccounts.find(acc => acc.Id === parseInt(id))
    if (!account) {
      throw new Error('Bank account not found')
    }

    if (!account.isConnected) {
      throw new Error('Account is not connected. Please reconnect first.')
    }

    // Update sync status
    const index = bankAccounts.findIndex(acc => acc.Id === parseInt(id))
    bankAccounts[index] = {
      ...bankAccounts[index],
      lastSync: new Date().toISOString(),
      syncStatus: 'success'
    }

    // Return mock transactions
    const mockTransactions = [
      {
        type: 'expense',
        amount: 45.67,
        category: 'Groceries',
        description: 'Whole Foods Market',
        date: new Date().toISOString().split('T')[0],
        recurring: false,
        bankAccountId: parseInt(id)
      },
      {
        type: 'expense',
        amount: 12.50,
        category: 'Transportation',
        description: 'Metro Card Reload',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        recurring: false,
        bankAccountId: parseInt(id)
      }
    ]

    return {
      account: { ...bankAccounts[index] },
      transactions: mockTransactions,
      importedCount: mockTransactions.length
    }
  },

  async getConnectedAccounts() {
    await new Promise(resolve => setTimeout(resolve, 200))
    return bankAccounts.filter(account => account.isConnected)
  },

  async updateSyncSettings(id, settings) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const index = bankAccounts.findIndex(account => account.Id === parseInt(id))
    if (index === -1) {
      throw new Error('Bank account not found')
    }

    bankAccounts[index] = {
      ...bankAccounts[index],
      syncSettings: { ...bankAccounts[index].syncSettings, ...settings }
    }
    return { ...bankAccounts[index] }
  }
}

export default bankAccountService