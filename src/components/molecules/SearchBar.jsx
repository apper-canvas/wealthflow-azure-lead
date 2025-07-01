import React from 'react'
import ApperIcon from '@/components/ApperIcon'

const SearchBar = ({ value, onChange, placeholder = "Search...", className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <ApperIcon name="Search" className="w-5 h-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-premium pl-10 w-full"
      />
    </div>
  )
}

export default SearchBar