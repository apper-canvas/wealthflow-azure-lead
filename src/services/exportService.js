import jsPDF from 'jspdf'
import 'jspdf-autotable'

const exportService = {
  // Generate CSV for transactions
  generateTransactionCSV(transactions, filename = 'transactions') {
    try {
      const csvContent = [
        ['Date', 'Type', 'Category', 'Description', 'Amount'],
        ...transactions.map(t => [
          t.date,
          t.type,
          t.category,
          t.description,
          t.amount
        ])
      ].map(row => row.join(',')).join('\n')

      this.downloadFile(csvContent, `${filename}-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv')
      return true
    } catch (error) {
      console.error('Error generating CSV:', error)
      throw new Error('Failed to generate CSV file')
    }
  },

  // Generate PDF for transactions
  generateTransactionPDF(transactions, filename = 'transactions') {
    try {
      const doc = new jsPDF()
      
      // Add title
      doc.setFontSize(20)
      doc.text('Transaction Report', 20, 20)
      
      // Add date range info
      doc.setFontSize(12)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35)
      doc.text(`Total Transactions: ${transactions.length}`, 20, 45)
      
      // Calculate totals
      const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
      const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
      
      doc.text(`Total Income: $${totalIncome.toLocaleString()}`, 20, 55)
      doc.text(`Total Expenses: $${totalExpenses.toLocaleString()}`, 20, 65)
      doc.text(`Net Balance: $${(totalIncome - totalExpenses).toLocaleString()}`, 20, 75)
      
      // Add table
      const tableData = transactions.map(t => [
        t.date,
        t.type.charAt(0).toUpperCase() + t.type.slice(1),
        t.category,
        t.description,
        `$${t.amount.toLocaleString()}`
      ])
      
      doc.autoTable({
        head: [['Date', 'Type', 'Category', 'Description', 'Amount']],
        body: tableData,
        startY: 85,
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        }
      })
      
      doc.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`)
      return true
    } catch (error) {
      console.error('Error generating PDF:', error)
      throw new Error('Failed to generate PDF file')
    }
  },

  // Generate CSV for financial summary
  generateFinancialSummaryCSV(summary, categoryData, monthlyData, filename = 'financial-summary') {
    try {
      let csvContent = 'Financial Summary Report\n\n'
      
      // Summary section
      csvContent += 'Summary\n'
      csvContent += 'Metric,Amount\n'
      csvContent += `Total Income,$${summary.totalIncome.toLocaleString()}\n`
      csvContent += `Total Expenses,$${summary.totalExpenses.toLocaleString()}\n`
      csvContent += `Net Income,$${summary.netIncome.toLocaleString()}\n`
      csvContent += `Savings Rate,${summary.savingsRate.toFixed(1)}%\n\n`
      
      // Top categories
      csvContent += 'Top Expense Categories\n'
      csvContent += 'Category,Amount,Percentage\n'
      categoryData.forEach(cat => {
        const percentage = summary.totalExpenses > 0 ? (cat.amount / summary.totalExpenses) * 100 : 0
        csvContent += `${cat.category},$${cat.amount.toLocaleString()},${percentage.toFixed(1)}%\n`
      })
      
      csvContent += '\nMonthly Trends\n'
      csvContent += 'Month,Income,Expenses\n'
      monthlyData.forEach(month => {
        csvContent += `${month.month},$${month.income.toLocaleString()},$${month.expenses.toLocaleString()}\n`
      })
      
      this.downloadFile(csvContent, `${filename}-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv')
      return true
    } catch (error) {
      console.error('Error generating summary CSV:', error)
      throw new Error('Failed to generate CSV file')
    }
  },

  // Generate PDF for financial summary
  generateFinancialSummaryPDF(summary, categoryData, monthlyData, filename = 'financial-summary') {
    try {
      const doc = new jsPDF()
      
      // Add title
      doc.setFontSize(20)
      doc.text('Financial Summary Report', 20, 20)
      
      // Add date info
      doc.setFontSize(12)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35)
      
      // Summary section
      doc.setFontSize(14)
      doc.text('Financial Overview', 20, 55)
      
      const summaryData = [
        ['Total Income', `$${summary.totalIncome.toLocaleString()}`],
        ['Total Expenses', `$${summary.totalExpenses.toLocaleString()}`],
        ['Net Income', `$${summary.netIncome.toLocaleString()}`],
        ['Savings Rate', `${summary.savingsRate.toFixed(1)}%`],
        ['Avg Monthly Income', `$${summary.averageMonthlyIncome.toLocaleString()}`],
        ['Avg Monthly Expenses', `$${summary.averageMonthlyExpenses.toLocaleString()}`]
      ]
      
      doc.autoTable({
        body: summaryData,
        startY: 65,
        styles: {
          fontSize: 12,
          cellPadding: 4
        },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { halign: 'right' }
        }
      })
      
      // Top categories section
      let currentY = doc.lastAutoTable.finalY + 20
      doc.setFontSize(14)
      doc.text('Top Expense Categories', 20, currentY)
      
      const categoryTableData = categoryData.map(cat => {
        const percentage = summary.totalExpenses > 0 ? (cat.amount / summary.totalExpenses) * 100 : 0
        return [
          cat.category,
          `$${cat.amount.toLocaleString()}`,
          `${percentage.toFixed(1)}%`
        ]
      })
      
      doc.autoTable({
        head: [['Category', 'Amount', 'Percentage']],
        body: categoryTableData,
        startY: currentY + 10,
        styles: {
          fontSize: 11,
          cellPadding: 3
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255
        }
      })
      
      // Monthly trends section
      currentY = doc.lastAutoTable.finalY + 20
      doc.setFontSize(14)
      doc.text('Monthly Trends', 20, currentY)
      
      const monthlyTableData = monthlyData.map(month => [
        month.month,
        `$${month.income.toLocaleString()}`,
        `$${month.expenses.toLocaleString()}`
      ])
      
      doc.autoTable({
        head: [['Month', 'Income', 'Expenses']],
        body: monthlyTableData,
        startY: currentY + 10,
        styles: {
          fontSize: 11,
          cellPadding: 3
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255
        }
      })
      
      doc.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`)
      return true
    } catch (error) {
      console.error('Error generating summary PDF:', error)
      throw new Error('Failed to generate PDF file')
    }
  },

  // Utility function to download files
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }
}

export default exportService