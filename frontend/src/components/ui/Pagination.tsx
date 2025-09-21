import React from 'react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  isDarkTheme: boolean
  position?: 'center' | 'right'
  className?: string
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  isDarkTheme,
  position = 'center',
  className = ''
}) => {
  if (totalPages <= 1) return null

  const justifyClass = position === 'right' ? 'justify-center lg:justify-end' : 'justify-center'

  return (
    <div className={`flex flex-wrap items-center ${justifyClass} gap-2 ${className}`}>
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`px-3 py-2 rounded border transition-colors disabled:cursor-not-allowed ${
          currentPage === 1
            ? isDarkTheme
              ? 'bg-gray-700 text-gray-500 border-gray-600'
              : 'bg-gray-100 text-gray-400 border-gray-200'
            : isDarkTheme
              ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        }`}
      >
        Previous
      </button>

      <div className="flex flex-wrap items-center gap-1">
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let pageNumber
          if (totalPages <= 5) {
            pageNumber = i + 1
          } else if (currentPage <= 3) {
            pageNumber = i + 1
          } else if (currentPage >= totalPages - 2) {
            pageNumber = totalPages - 4 + i
          } else {
            pageNumber = currentPage - 2 + i
          }
          return pageNumber
        }).map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 rounded border transition-colors ${
              page === currentPage
                ? isDarkTheme
                  ? 'bg-gray-700 text-white border-gray-600'
                  : 'bg-gray-900 text-white border-gray-900'
                : isDarkTheme
                  ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`px-3 py-2 rounded border transition-colors disabled:cursor-not-allowed ${
          currentPage === totalPages
            ? isDarkTheme
              ? 'bg-gray-700 text-gray-500 border-gray-600'
              : 'bg-gray-100 text-gray-400 border-gray-200'
            : isDarkTheme
              ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        }`}
      >
        Next
      </button>
    </div>
  )
}

export default Pagination