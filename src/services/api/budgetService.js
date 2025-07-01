import budgetsData from '../mockData/budgets.json'

let budgets = [...budgetsData]

const budgetService = {
  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300))
    return [...budgets].sort((a, b) => b.month.localeCompare(a.month))
  },

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    return budgets.find(budget => budget.Id === parseInt(id))
  },

  async getByMonth(month) {
    await new Promise(resolve => setTimeout(resolve, 250))
    return budgets.find(budget => budget.month === month)
  },

  async create(budgetData) {
    await new Promise(resolve => setTimeout(resolve, 400))
    const maxId = Math.max(...budgets.map(b => b.Id), 0)
    const newBudget = {
      ...budgetData,
      Id: maxId + 1
    }
    budgets.push(newBudget)
    return { ...newBudget }
  },

  async update(id, budgetData) {
    await new Promise(resolve => setTimeout(resolve, 350))
    const index = budgets.findIndex(budget => budget.Id === parseInt(id))
    if (index !== -1) {
      budgets[index] = { ...budgets[index], ...budgetData }
      return { ...budgets[index] }
    }
    throw new Error('Budget not found')
  },

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const index = budgets.findIndex(budget => budget.Id === parseInt(id))
    if (index !== -1) {
      const deleted = budgets.splice(index, 1)[0]
      return { ...deleted }
    }
    throw new Error('Budget not found')
  }
}

export default budgetService