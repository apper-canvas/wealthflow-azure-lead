import goalsData from '../mockData/goals.json'

let goals = [...goalsData]

const goalService = {
  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300))
    return [...goals].sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate))
  },

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    return goals.find(goal => goal.Id === parseInt(id))
  },

  async create(goalData) {
    await new Promise(resolve => setTimeout(resolve, 400))
    const maxId = Math.max(...goals.map(g => g.Id), 0)
    const newGoal = {
      ...goalData,
      Id: maxId + 1,
      currentAmount: goalData.currentAmount || 0
    }
    goals.push(newGoal)
    return { ...newGoal }
  },

  async update(id, goalData) {
    await new Promise(resolve => setTimeout(resolve, 350))
    const index = goals.findIndex(goal => goal.Id === parseInt(id))
    if (index !== -1) {
      goals[index] = { ...goals[index], ...goalData }
      return { ...goals[index] }
    }
    throw new Error('Goal not found')
  },

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const index = goals.findIndex(goal => goal.Id === parseInt(id))
    if (index !== -1) {
      const deleted = goals.splice(index, 1)[0]
      return { ...deleted }
    }
    throw new Error('Goal not found')
  },

  async addContribution(id, amount) {
    await new Promise(resolve => setTimeout(resolve, 250))
    const index = goals.findIndex(goal => goal.Id === parseInt(id))
    if (index !== -1) {
      goals[index].currentAmount += amount
      return { ...goals[index] }
    }
    throw new Error('Goal not found')
  }
}

export default goalService