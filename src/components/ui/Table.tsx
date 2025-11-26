import React from 'react';
import { motion } from 'framer-motion';
interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}
interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  keyExtractor: (row: T) => string | number;
  emptyMessage?: string;
  className?: string;
}
export function Table<T>({
  columns,
  data,
  isLoading = false,
  onRowClick,
  keyExtractor,
  emptyMessage = 'No data available',
  className = ''
}: TableProps<T>) {
  const renderCell = (row: T, column: TableColumn<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row);
    }
    return row[column.accessor as keyof T];
  };
  if (isLoading) {
    return <div className={`bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden ${className}`}>
        <div className="animate-pulse">
          <div className="bg-gray-100 px-6 py-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          </div>
          {[...Array(5)].map((_, i) => <div key={i} className="border-t border-gray-100 px-6 py-4">
              <div className="h-5 bg-gray-200 rounded w-full"></div>
            </div>)}
        </div>
      </div>;
  }
  if (data.length === 0) {
    return <div className={`bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center ${className}`}>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>;
  }
  return <div className={`bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => <th key={index} scope="col" className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}>
                {column.header}
              </th>)}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => <motion.tr key={keyExtractor(row)} initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.2,
          delay: rowIndex * 0.05
        }} onClick={onRowClick ? () => onRowClick(row) : undefined} className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}>
              {columns.map((column, colIndex) => <td key={`${keyExtractor(row)}-${colIndex}`} className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${column.className || ''}`}>
                  {renderCell(row, column)}
                </td>)}
            </motion.tr>)}
        </tbody>
      </table>
    </div>;
}