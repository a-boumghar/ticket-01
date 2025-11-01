import React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
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
            {['Name', 'City', 'ClientN', 'Courier', 'Tracking', 'Invoice', 'Cartons'].map(header => (
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
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">{row.name}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">{row.city}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{row.clientN}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm">
                <select 
                  value={row.courier}
                  onChange={(e) => onUpdate(row.id, 'courier', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  {COURIER_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm">
                 <input 
                  type="text" 
                  value={row.tracking} 
                  onChange={(e) => onUpdate(row.id, 'tracking', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                 />
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm">
                <input 
                  type="text" 
                  value={row.invoice} 
                  onChange={(e) => onUpdate(row.id, 'invoice', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm">
                <input
                  type="number"
                  value={row.cartons}
                  onChange={(e) => onUpdate(row.id, 'cartons', parseInt(e.target.value, 10) || 1)}
                  min="1"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
      <div className="w-full h-full border-4 border-black box-border flex flex-col font-sans text-black">
        {/* Top Logos */}
        <div className="h-[20mm] flex items-center justify-center border-b-4 border-black p-2">
          <img src="https://i.ibb.co/Cp2Myhk8/121-copy.png" alt="Logos" className="max-h-full max-w-full object-contain" />
        </div>

        {/* Middle Section */}
        <div className="flex-1 grid grid-cols-2">
          {/* Left Column (Cartons) */}
          <div className="flex flex-col text-center">
            <div className="flex-[1_1_30%] flex items-center justify-center border-b-2 border-black">
              <p className="text-3xl font-bold" dir="rtl">عدد كوليات</p>
            </div>
            <div className="flex-[1_1_70%] flex items-center justify-center">
              <p className="text-8xl font-extrabold tracking-tighter">{label.cartonNumber}</p>
            </div>
          </div>
          {/* Right Column (Name & City) */}
          <div className="flex flex-col text-center border-l-4 border-black">
            <div className="flex-[1_1_60%] flex items-center justify-center border-b-2 border-black px-1">
              <p className="text-6xl font-bold break-all" dir={nameDir}>{label.name}</p>
            </div>
            <div className="flex-[1_1_40%] flex items-center justify-center px-1">
              <p className="text-6xl font-bold break-all" dir={cityDir}>{label.city}</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t-4 border-black font-bold text-base">
          <div className="flex justify-between items-center py-1 px-2 border-b-2 border-black">
            <span>{label.courier} N°:</span>
            <span className="text-lg">{label.tracking}</span>
          </div>
          <div className="flex justify-between items-center py-1 px-2 border-b-2 border-black text-sm">
            <span>FACTURE N°: {label.invoice} {todayDate}</span>
            <span>CLIENT N°: {label.clientN}</span>
          </div>
          <div className="text-center py-1 px-2 text-sm">
            <span>0528.98.51.93 / 0661.50.31.02</span>
          </div>
        </div>
      </div>
    </div>
  );
};


interface PrintPreviewProps {
  labels: LabelData[];
  onClose: () => void;
  onPrint: () => void;
}

const PrintPreview: React.FC<PrintPreviewProps> = ({ labels, onClose, onPrint }) => {
  return (
    <div id="print-preview-overlay">
      <div id="print-preview-header">
        <div className="container mx-auto flex justify-between items-center">
            <h2 className="text-xl font-bold">Print Preview ({labels.length} labels)</h2>
            <div>
              <button
                onClick={onPrint}
                className="px-4 py-2 mr-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Print
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Exit Preview
              </button>
            </div>
        </div>
      </div>
      <div id="print-container">
        {labels.map((label, index) => (
          <Label key={`${label.id}-${index}`} label={label} />
        ))}
      </div>
    </div>
  );
};


// --- Main App Component ---

function App() {
  const [data, setData] = useState<ShippingData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [dirtyRows, setDirtyRows] = useState<Set<number>>(new Set());
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSheetData();
      setData(result);
    } catch (e) {
      setError("Failed to load data.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdate = (id: number, field: keyof ShippingData, value: string | number) => {
    setData(currentData =>
      currentData.map(row => (row.id === id ? { ...row, [field]: value } : row))
    );
    setDirtyRows(currentDirty => new Set(currentDirty.add(id)));
  };

  const handleSelectionChange = (id: number, isSelected: boolean) => {
    setSelectedRows(currentSelected => {
      const newSelected = new Set(currentSelected);
      if (isSelected) {
        newSelected.add(id);
      } else {
        newSelected.delete(id);
      }
      return newSelected;
    });
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedRows(new Set(data.map(row => row.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSave = async () => {
    if (dirtyRows.size === 0) {
      alert("No changes to save.");
      return;
    }
    setIsSaving(true);
    const updates = data.filter(row => dirtyRows.has(row.id));
    try {
      await updateSheetData(updates);
      setDirtyRows(new Set());
      alert("Changes saved successfully!");
    } catch (e) {
      alert("Failed to save changes.");
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleShowPreview = () => {
    if (selectedRows.size === 0) {
      alert("Please select rows to generate labels.");
      return;
    }
    setIsPrinting(true);
  };

  const handleActualPrint = () => {
      window.print();
  };
  
  useEffect(() => {
    const handleAfterPrint = () => {
        setIsPrinting(false);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
        window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);


  const labelsToPrint = useMemo((): LabelData[] => {
    if (!isPrinting) return [];
    
    const labels: LabelData[] = [];
    data.forEach(row => {
      if (selectedRows.has(row.id)) {
        for (let i = 1; i <= row.cartons; i++) {
          labels.push({ ...row, cartonNumber: row.cartons });
        }
      }
    });
    return labels;
  }, [isPrinting, data, selectedRows]);

  if (isPrinting) {
    return <PrintPreview labels={labelsToPrint} onClose={() => setIsPrinting(false)} onPrint={handleActualPrint} />;
  }

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Shipping Label Pro</h1>
          <p className="text-gray-600 mt-1">Manage shipping data and generate labels with ease.</p>
        </header>

        <div className="sticky top-0 bg-gray-100/80 backdrop-blur-sm z-10 py-4 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleShowPreview}
              disabled={selectedRows.size === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-indigo-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Generate Labels ({selectedRows.size})
            </button>
            <button
              onClick={handleSave}
              disabled={dirtyRows.size === 0 || isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700 disabled:bg-green-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {isSaving ? 'Saving...' : `Save Changes (${dirtyRows.size})`}
            </button>
            <button
              onClick={loadData}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center p-10 bg-white rounded-lg shadow">Loading data...</div>
        ) : error ? (
          <div className="text-center p-10 bg-red-100 text-red-700 rounded-lg shadow">{error}</div>
        ) : (
          <DataTable
            data={data}
            selectedRows={selectedRows}
            dirtyRows={dirtyRows}
            onSelectionChange={handleSelectionChange}
            onSelectAll={handleSelectAll}
            onUpdate={handleUpdate}
          />
        )}
      </div>
    </div>
  );
}

export default App;