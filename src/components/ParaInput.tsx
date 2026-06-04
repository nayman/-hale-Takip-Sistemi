'use client'

import React, { useState, useEffect, forwardRef } from 'react'

interface ParaInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: number
  onChange?: (value: number) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  allowNegative?: boolean
  decimalScale?: number
}

const ParaInput = forwardRef<HTMLInputElement, ParaInputProps>(
  ({ value, onChange, placeholder, disabled, className, allowNegative = true, decimalScale = 2, ...props }, ref
) => {
    const [displayValue, setDisplayValue] = useState<string>('')
    const [isFocused, setIsFocused] = useState(false)

    // Format number with thousand separators and decimal
    const formatNumber = (num: number): string => {
      if (isNaN(num)) return ''
      
      const fixedNum = decimalScale > 0 ? num.toFixed(decimalScale) : num.toString()
      const parts = fixedNum.split('.')
      
      // Add thousand separators
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      
      return parts.join('.')
    }

    // Parse string to number
    const parseNumber = (str: string): number => {
      if (!str) return 0
      
      // Remove thousand separators and convert dots to decimals
      const cleanStr = str.replace(/\./g, '').replace(',', '.')
      const num = parseFloat(cleanStr)
      
      if (isNaN(num)) return 0
      
      // Handle negative numbers
      const isNegative = cleanStr.startsWith('-')
      const absoluteNum = Math.abs(num)
      
      return isNegative && !allowNegative ? 0 : (isNegative ? -absoluteNum : absoluteNum)
    }

    // Update display value when prop changes
    useEffect(() => {
      if (value !== undefined && !isFocused) {
        setDisplayValue(formatNumber(value))
      }
    }, [value, isFocused, decimalScale])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      setDisplayValue(inputValue)
      
      const numValue = parseNumber(inputValue)
      onChange?.(numValue)
    }

    const handleFocus = () => {
      setIsFocused(true)
      if (value !== undefined) {
        // Show raw number on focus
        setDisplayValue(decimalScale > 0 ? value.toFixed(decimalScale) : value.toString())
      }
    }

    const handleBlur = () => {
      setIsFocused(false)
      if (value !== undefined) {
        setDisplayValue(formatNumber(value))
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow only numbers, decimal point, and minus sign
      const allowedKeys = [
        'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
        'ArrowLeft', 'ArrowRight', 'Home', 'End',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        '.', ',', '-', // For negative numbers and decimals
      ]
      
      if (!allowedKeys.includes(e.key) && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
      }
    }

    return (
      <div className="relative">
        <input
          {...props}
          ref={ref}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || '0,00'}
          disabled={disabled}
          className={`text-right ${className || ''}`}
          style={{
            textAlign: 'right',
            ...props.style,
          }}
        />
        {displayValue && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
            ₺
          </span>
        )}
      </div>
    )
  }
)

ParaInput.displayName = 'ParaInput'

export { ParaInput }
export type { ParaInputProps }

// Currency utility functions
export const ParaUtils = {
  format: (value: number, decimalScale = 2, showSymbol = true): string => {
    if (isNaN(value)) return '0'
    
    const formatted = value.toFixed(decimalScale).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    return showSymbol ? `${formatted} ₺` : formatted
  },

  parse: (value: string): number => {
    if (!value) return 0
    
    const cleanStr = value.replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.')
    const num = parseFloat(cleanStr)
    
    return isNaN(num) ? 0 : num
  },

  validate: (value: string, min?: number, max?: number): { isValid: boolean; error?: string } => {
    const num = ParaUtils.parse(value)
    
    if (min !== undefined && num < min) {
      return { isValid: false, error: `Minimum değer ${min} olmalıdır` }
    }
    
    if (max !== undefined && num > max) {
      return { isValid: false, error: `Maksimum değer ${max} olmalıdır` }
    }
    
    return { isValid: true }
  },

  // Turkish number formatting
  formatTurkish: (value: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(value)
  },
}

export default ParaInput
