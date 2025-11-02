
import React from 'react';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { ShippingData, Courier } from './types';
import { getSheetData } from './services/mockSheetService';
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
            <th className="px-4 py-3 text-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
              />
            </th>
            {['Full Name', 'Name', 'City', 'ClientN', 'Courier', 'Tracking', 'Invoice', 'Cartons'].map(header => (
              <th key={header} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row) => (
            <tr key={row.id} className={`${dirtyRows.has(row.id) ? 'bg-yellow-50' : ''} hover:bg-gray-50`}>
              <td className="px-4 py-4 whitespace-nowrap text-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  checked={selectedRows.has(row.id)}
                  onChange={(e) => onSelectionChange(row.id, e.target.checked)}
                />
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{row.fullName}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800 text-center">{row.name}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800 text-center">{row.city}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-center">{row.clientN}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                <select 
                  value={row.courier}
                  onChange={(e) => onUpdate(row.id, 'courier', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-center"
                >
                  {COURIER_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                 <input 
                  type="text" 
                  value={row.tracking} 
                  onChange={(e) => onUpdate(row.id, 'tracking', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-center"
                 />
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                <input 
                  type="text" 
                  value={row.invoice} 
                  onChange={(e) => onUpdate(row.id, 'invoice', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-center"
                />
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                <input
                  type="number"
                  value={row.cartons}
                  onChange={(e) => {
                    const num = parseInt(e.target.value, 10);
                    onUpdate(row.id, 'cartons', num > 0 ? num : '');
                  }}
                  min="1"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-center"
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
      <div className="w-full h-full box-border flex flex-col font-sans text-black">
        {/* Top Logos */}
        <div className="h-[20mm] flex items-center justify-center border-b-4 border-black p-2">
          <img src="https://i.ibb.co/Cp2Myhk8/121-copy.png" alt="Logos" className="max-h-full max-w-full object-contain" />
        </div>

        {/* Middle Section */}
        <div className="flex-1 flex">
          {/* Left Column (Cartons) - 35% */}
          <div className="w-[35%] flex flex-col text-center">
            <div className="flex-[1_1_30%] flex items-center justify-center border-b-2 border-black">
              <p className="text-xl font-bold" dir="rtl">عدد كوليات</p>
            </div>
            <div className="flex-[1_1_70%] flex items-center justify-center p-1">
              <div className="flex items-baseline justify-center leading-none">
                <span className="text-8xl font-extrabold tracking-tighter">{label.totalCartons}</span>
              </div>
            </div>
          </div>
          {/* Right Column (Name & City) - 65% */}
          <div className="w-[65%] flex flex-col text-center border-l-4 border-black">
            <div className="flex-[1_1_60%] flex items-center justify-center border-b-2 border-black px-1">
              <p className="text-5xl font-bold break-all" dir={nameDir}>{label.name}</p>
            </div>
            <div className="flex-[1_1_40%] flex items-center justify-center px-1">
              <p className="text-5xl font-bold break-all" dir={cityDir}>{label.city}</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t-4 border-black font-bold text-base">
          <div className="flex justify-center items-center border-b-2 border-black">
            <span className="py-1 px-2">{label.courier} N°:</span>
            <span className="py-1 px-2 text-lg">{label.tracking}</span>
          </div>
          <div className="flex items-center text-center border-b-2 border-black text-sm">
            <span className="w-[38%] px-1 py-1 border-r-2 border-black">FACTURE N°: {label.invoice}</span>
            <span className="w-[24%] px-1 py-1 border-r-2 border-black">{todayDate}</span>
            <span className="w-[38%] px-1 py-1">CLIENT N°: {label.clientN}</span>
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

interface StatsBarProps {
  selectedOrders: number;
  totalCartons: number;
}

const StatsBar: React.FC<StatsBarProps> = ({ selectedOrders, totalCartons }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Selected Orders</p>
          <p className="text-3xl font-bold text-gray-800">{selectedOrders}</p>
        </div>
        <div className="bg-indigo-100 p-3 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Cartons</p>
          <p className="text-3xl font-bold text-gray-800">{totalCartons}</p>
        </div>
        <div className="bg-green-100 p-3 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
      </div>
    </div>
  );
};


// --- Main App Component ---

// Helpers to get initial state from localStorage, with a fallback.
const getInitialState = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

const getInitialSetState = <T,>(key: string): Set<T> => {
  try {
    const item = window.localStorage.getItem(key);
    // The stored value for a Set is an array.
    return item ? new Set(JSON.parse(item)) : new Set();
  } catch (error) {
    console.error(`Error reading localStorage key “${key}”:`, error);
    return new Set();
  }
};


function App() {
  const [data, setData] = useState<ShippingData[]>(() => getInitialState('shippingData', []));
  const [loading, setLoading] = useState<boolean>(data.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(() => getInitialSetState('selectedRows'));
  const [dirtyRows, setDirtyRows] = useState<Set<number>>(() => getInitialSetState('dirtyRows'));
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  // --- Data Loading and Persistence ---

  // Effect for initial data fetch if localStorage was empty
  useEffect(() => {
    const fetchInitialData = async () => {
        // Only fetch if data is empty after initial load from localStorage
        if (data.length === 0) {
            setLoading(true);
            setError(null);
            try {
                const sheetData = await getSheetData();
                setData(sheetData);
            } catch (e) {
                setError("Failed to fetch from Google Sheets. Please check your connection.");
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
    };
    fetchInitialData();
  }, []); // Note: data.length check inside makes this safe to run once.

  // Effect to persist state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('shippingData', JSON.stringify(data));
      localStorage.setItem('dirtyRows', JSON.stringify(Array.from(dirtyRows)));
      localStorage.setItem('selectedRows', JSON.stringify(Array.from(selectedRows)));
    } catch (error) {
      console.error("Failed to save data to local storage", error);
    }
  }, [data, dirtyRows, selectedRows]);

  // Effect to toggle body class for printing
  useEffect(() => {
    if (isPrinting) {
      document.body.classList.add('print-active');
    } else {
      document.body.classList.remove('print-active');
    }
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('print-active');
    };
  }, [isPrinting]);

  // --- Event Handlers ---

  const handleUpdate = (id: number, field: keyof ShippingData, value: string | number) => {
    setData(currentData =>
      currentData.map(row => (row.id === id ? { ...row, [field]: value } : row))
    );
    setDirtyRows(currentDirty => {
      const newDirty = new Set(currentDirty);
      newDirty.add(id);
      return newDirty;
    });
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
        const numCartons = Number(row.cartons) || 0;
        for (let i = 1; i <= numCartons; i++) {
          labels.push({ ...row, cartonNumber: i, totalCartons: numCartons });
        }
      }
    });
    return labels;
  }, [isPrinting, data, selectedRows]);

  const { totalCartons } = useMemo(() => {
    const totalCartons = data.reduce((sum, row) => {
      const cartonsCount = Number(row.cartons);
      return sum + (isNaN(cartonsCount) ? 0 : cartonsCount);
    }, 0);
    return { totalCartons };
  }, [data]);

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      {isPrinting && <PrintPreview labels={labelsToPrint} onClose={() => setIsPrinting(false)} onPrint={handleActualPrint} />}
      
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Shipping Label Pro</h1>
          <p className="text-gray-600 mt-1">Manage shipping data and generate labels with ease.</p>
        </header>

        <StatsBar selectedOrders={selectedRows.size} totalCartons={totalCartons} />

        <div className="sticky top-0 bg-gray-100/80 backdrop-blur-sm z-10 py-4 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleShowPreview}
              disabled={selectedRows.size === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-indigo-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Generate Labels ({selectedRows.size})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center p-10 bg-white rounded-lg shadow">Loading data from Google Sheets...</div>
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
