import transactionsData from '../mockData/transactions.json'

let transactions = [...transactionsData]

const transactionService = {
  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300))
    return [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date))
  },

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    return transactions.find(transaction => transaction.Id === parseInt(id))
  },

  async create(transactionData) {
    await new Promise(resolve => setTimeout(resolve, 400))
    const maxId = Math.max(...transactions.map(t => t.Id), 0)
    const newTransaction = {
      ...transactionData,
      Id: maxId + 1,
      date: transactionData.date || new Date().toISOString().split('T')[0]
    }
    transactions.push(newTransaction)
    return { ...newTransaction }
  },

  async update(id, transactionData) {
    await new Promise(resolve => setTimeout(resolve, 350))
    const index = transactions.findIndex(transaction => transaction.Id === parseInt(id))
    if (index !== -1) {
      transactions[index] = { ...transactions[index], ...transactionData }
      return { ...transactions[index] }
    }
    throw new Error('Transaction not found')
  },

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const index = transactions.findIndex(transaction => transaction.Id === parseInt(id))
    if (index !== -1) {
      const deleted = transactions.splice(index, 1)[0]
      return { ...deleted }
    }
    throw new Error('Transaction not found')
  },

  async getByDateRange(startDate, endDate) {
    await new Promise(resolve => setTimeout(resolve, 250))
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date)
      return transactionDate >= new Date(startDate) && transactionDate <= new Date(endDate)
    }).sort((a, b) => new Date(b.date) - new Date(a.date))
  },

  async getByCategory(category) {
    await new Promise(resolve => setTimeout(resolve, 200))
    return transactions.filter(transaction => 
      transaction.category.toLowerCase() === category.toLowerCase()
).sort((a, b) => new Date(b.date) - new Date(a.date))
  },

  async importFromBank(bankTransactions) {
    await new Promise(resolve => setTimeout(resolve, 500))
    const importedTransactions = []
    
    for (const bankTx of bankTransactions) {
      const maxId = Math.max(...transactions.map(t => t.Id), 0)
      const newTransaction = {
        ...bankTx,
        Id: maxId + importedTransactions.length + 1,
        date: bankTx.date || new Date().toISOString().split('T')[0],
        imported: true,
        importDate: new Date().toISOString()
      }
      transactions.push(newTransaction)
      importedTransactions.push({ ...newTransaction })
    }
    
    return importedTransactions
  }
}

export default transactionService