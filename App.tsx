
import React from 'react';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { ShippingData, Courier } from './types';
import { getSheetData, updateSheetData } from './services/mockSheetService';
import { COURIER_OPTIONS } from './types';

// --- Helper Functions ---
const isRtl = (text: string) => /[\u0600-\u06FF]/.test(text);

const getTodayDate = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
};


// --- Sub-components defined outside the main App component ---

interface DataTableProps {
  data: ShippingData[];
  selectedRows: Set<number>;
  dirtyRows: Set<number>;
  onSelectionChange: (id: number, isSelected: boolean) => void;
  onSelectAll: (isSelected: boolean) => void;
  onUpdate: (id: number, field: keyof ShippingData, value: string | number) => void;
}

const DataTable: React.FC<DataTableProps> = ({ data, selectedRows, dirtyRows, onSelectionChange, onSelectAll, onUpdate }) => {
  const allSelected = data.length > 0 && selectedRows.size === data.length;

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left">
              <input
                type="checkbox"
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
              />
            </th>
            {['Full Name', 'Name', 'City', 'ClientN', 'Courier', 'Tracking', 'Invoice', 'Cartons'].map(header => (
              <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row) => (
            <tr key={row.id} className={`${dirtyRows.has(row.id) ? 'bg-yellow-50' : ''} hover:bg-gray-50`}>
              <td className="px-4 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  checked={selectedRows.has(row.id)}
                  onChange={(e) => onSelectionChange(row.id, e.target.checked)}
                />
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{row.fullName}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">{row.name}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">{row.city}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{row.clientN}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm">
                <select 
                  value={row.courier}
                  onChange={(e) => onUpdate(row.id, 'courier', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                >
                  {COURIER_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm">
                 <input 
                  type="text" 
                  value={row.tracking} 
                  onChange={(e) => onUpdate(row.id, 'tracking', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                 />
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm">
                <input 
                  type="text" 
                  value={row.invoice} 
                  onChange={(e) => onUpdate(row.id, 'invoice', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                />
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm">
                <input
                  type="number"
                  value={row.cartons}
                  onChange={(e) => onUpdate(row.id, 'cartons', parseInt(e.target.value, 10) || 0)}
                  min="0"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


interface LabelData extends ShippingData {
  cartonNumber: number;
  totalCartons: number;
}

interface LabelProps {
  label: LabelData;
}

const Label: React.FC<LabelProps> = ({ label }) => {
  const nameDir = isRtl(label.name) ? 'rtl' : 'ltr';
  const cityDir = isRtl(label.city) ? 'rtl' : 'ltr';
  const todayDate = getTodayDate();

  return (
    <div className="label-print-page bg-white">
      <div className="w-full h-full box-border flex flex