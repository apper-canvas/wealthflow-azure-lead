import React from 'react'
import ReactApexChart from 'react-apexcharts'

const ExpenseChart = ({ data, loading = false }) => {
  const chartOptions = {
    chart: {
      type: 'pie',
      height: 350,
      fontFamily: 'Inter, system-ui, sans-serif',
      toolbar: {
        show: false
      }
    },
    colors: [
      '#2563eb', '#7c3aed', '#10b981', '#f59e0b',
      '#ef4444', '#06b6d4', '#8b5cf6', '#f97316'
    ],
    labels: data?.map(item => item.category) || [],
    legend: {
      position: 'bottom',
      fontSize: '14px',
      fontWeight: 500,
      labels: {
        colors: '#374151'
      },
      markers: {
        width: 12,
        height: 12,
        radius: 3
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '45%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '16px',
              fontWeight: 600,
              color: '#374151'
            },
            value: {
              show: true,
              fontSize: '20px',
              fontWeight: 700,
              color: '#111827',
              formatter: function (val) {
                return '$' + parseInt(val).toLocaleString()
              }
            },
            total: {
              show: true,
              showAlways: true,
              label: 'Total Expenses',
              fontSize: '14px',
              fontWeight: 500,
              color: '#6b7280',
              formatter: function (w) {
                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0)
                return '$' + total.toLocaleString()
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    tooltip: {
      style: {
        fontSize: '14px',
        fontFamily: 'Inter, system-ui, sans-serif'
      },
      y: {
        formatter: function (val) {
          return '$' + val.toLocaleString()
        }
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          height: 300
        },
        legend: {
          fontSize: '12px'
        }
      }
    }]
  }

  const series = data?.map(item => item.amount) || []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-64 h-64 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <ReactApexChart
        options={chartOptions}
        series={series}
        type="pie"
        height={350}
      />
    </div>
  )
}

export default ExpenseChart