import React from 'react'
import ReactApexChart from 'react-apexcharts'

const IncomeExpenseChart = ({ data, loading = false }) => {
  const chartOptions = {
    chart: {
      type: 'bar',
      height: 350,
      fontFamily: 'Inter, system-ui, sans-serif',
      toolbar: {
        show: false
      }
    },
    colors: ['#10b981', '#ef4444'],
    xaxis: {
      categories: data?.map(item => item.month) || [],
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px',
          fontWeight: 500
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px',
          fontWeight: 500
        },
        formatter: function (val) {
          return '$' + val.toLocaleString()
        }
      }
    },
    legend: {
      position: 'top',
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
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 0
    },
    grid: {
      borderColor: '#f3f4f6',
      strokeDashArray: 3
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
        plotOptions: {
          bar: {
            columnWidth: '70%'
          }
        }
      }
    }]
  }

  const series = [
    {
      name: 'Income',
      data: data?.map(item => item.income) || []
    },
    {
      name: 'Expenses',
      data: data?.map(item => item.expenses) || []
    }
  ]

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-200 rounded"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full">
      <ReactApexChart
        options={chartOptions}
        series={series}
        type="bar"
        height={350}
      />
    </div>
  )
}

export default IncomeExpenseChart