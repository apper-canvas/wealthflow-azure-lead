import billsData from '../mockData/bills.json'

let bills = [...billsData]

const billService = {
  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300))
    return [...bills].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  },

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    return bills.find(bill => bill.Id === parseInt(id))
  },

  async create(billData) {
    await new Promise(resolve => setTimeout(resolve, 400))
    const maxId = Math.max(...bills.map(b => b.Id), 0)
    const newBill = {
      ...billData,
      Id: maxId + 1,
      status: billData.status || 'pending'
    }
    bills.push(newBill)
    return { ...newBill }
  },

  async update(id, billData) {
    await new Promise(resolve => setTimeout(resolve, 350))
    const index = bills.findIndex(bill => bill.Id === parseInt(id))
    if (index !== -1) {
      bills[index] = { ...bills[index], ...billData }
      return { ...bills[index] }
    }
    throw new Error('Bill not found')
  },

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const index = bills.findIndex(bill => bill.Id === parseInt(id))
    if (index !== -1) {
      const deleted = bills.splice(index, 1)[0]
      return { ...deleted }
    }
    throw new Error('Bill not found')
  },

  async markAsPaid(id) {
    await new Promise(resolve => setTimeout(resolve, 250))
    const index = bills.findIndex(bill => bill.Id === parseInt(id))
    if (index !== -1) {
      bills[index].status = 'paid'
      return { ...bills[index] }
    }
    throw new Error('Bill not found')
  },

  async getUpcoming(days = 7) {
    await new Promise(resolve => setTimeout(resolve, 200))
    const today = new Date()
    const futureDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000))
    
    return bills.filter(bill => {
      const dueDate = new Date(bill.dueDate)
      return dueDate >= today && dueDate <= futureDate && bill.status === 'pending'
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  }
}

export default billService