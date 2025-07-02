import templatesData from '../mockData/templates.json'

let templates = [...templatesData]

const templateService = {
  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300))
    return [...templates].sort((a, b) => a.name.localeCompare(b.name))
  },

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    return templates.find(template => template.Id === parseInt(id))
  },

  async create(templateData) {
    await new Promise(resolve => setTimeout(resolve, 400))
    const maxId = Math.max(...templates.map(t => t.Id), 0)
    const newTemplate = {
      ...templateData,
      Id: maxId + 1
    }
    templates.push(newTemplate)
    return { ...newTemplate }
  },

  async update(id, templateData) {
    await new Promise(resolve => setTimeout(resolve, 350))
    const index = templates.findIndex(template => template.Id === parseInt(id))
    if (index !== -1) {
      templates[index] = { ...templates[index], ...templateData }
      return { ...templates[index] }
    }
    throw new Error('Template not found')
  },

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const index = templates.findIndex(template => template.Id === parseInt(id))
    if (index !== -1) {
      const deleted = templates.splice(index, 1)[0]
      return { ...deleted }
    }
    throw new Error('Template not found')
  },

  async getByType(type) {
    await new Promise(resolve => setTimeout(resolve, 250))
    return templates.filter(template => 
      template.type.toLowerCase() === type.toLowerCase()
    ).sort((a, b) => a.name.localeCompare(b.name))
  },

  async getByCategory(category) {
    await new Promise(resolve => setTimeout(resolve, 200))
    return templates.filter(template => 
      template.category.toLowerCase() === category.toLowerCase()
    ).sort((a, b) => a.name.localeCompare(b.name))
  }
}

export default templateService