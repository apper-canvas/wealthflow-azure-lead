import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import Button from '@/components/atoms/Button'
import Select from '@/components/atoms/Select'
import ApperIcon from '@/components/ApperIcon'
import exportService from '@/services/exportService'

const ExportDialog = ({ 
  isOpen, 
  onClose, 
  exportType = 'transactions',
  data = {},
  title = 'Export Report'
}) => {
  const [format, setFormat] = useState('csv')
  const [loading, setLoading] = useState(false)

  const formatOptions = [
    { value: 'csv', label: 'CSV (Spreadsheet)' },
    { value: 'pdf', label: 'PDF (Document)' }
  ]

  const handleExport = async () => {
    if (!data) {
      toast.error('No data available for export')
      return
    }

    setLoading(true)
    
    try {
      let success = false
      
      if (exportType === 'transactions') {
        if (format === 'csv') {
          success = exportService.generateTransactionCSV(data.transactions || [], 'transactions')
        } else {
          success = exportService.generateTransactionPDF(data.transactions || [], 'transactions')
        }
      } else if (exportType === 'financial-summary') {
        if (format === 'csv') {
          success = exportService.generateFinancialSummaryCSV(
            data.summary || {},
            data.categoryData || [],
            data.monthlyData || [],
            'financial-summary'
          )
        } else {
          success = exportService.generateFinancialSummaryPDF(
            data.summary || {},
            data.categoryData || [],
            data.monthlyData || [],
            'financial-summary'
          )
        }
      }
      
      if (success) {
        toast.success(`Report exported successfully as ${format.toUpperCase()}`)
        onClose()
      }
    } catch (error) {
      toast.error(error.message || 'Failed to export report')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="card-premium p-6 w-full max-w-md"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
                <ApperIcon name="Download" className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600">Choose your export format</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            >
              <ApperIcon name="X" className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <Select
              label="Export Format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              options={formatOptions}
              required
            />

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <ApperIcon name="Info" className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-1">Format Information:</p>
                  {format === 'csv' ? (
                    <p>CSV files can be opened in spreadsheet applications like Excel or Google Sheets for data analysis.</p>
                  ) : (
                    <p>PDF files are perfect for printing or sharing as formatted reports with charts and summaries.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleExport}
                variant="primary"
                icon="Download"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Exporting...' : `Export ${format.toUpperCase()}`}
              </Button>
              <Button
                onClick={onClose}
                variant="secondary"
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ExportDialog