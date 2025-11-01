
import type { ShippingData } from '../types';

const MOCK_DATA: ShippingData[] = [
  { id: 1, name: 'John Doe', city: 'New York', clientN: 'CUST-001', courier: 'BAHA EXPRESS', tracking: 'TRK12345', invoice: 'INV-2024-001', cartons: 1 },
  { id: 2, name: 'Jane Smith', city: 'London', clientN: 'CUST-002', courier: 'SAT EXPRESS', tracking: 'TRK67890', invoice: 'INV-2024-002', cartons: 3 },
  { id: 3, name: 'علي الأحمد', city: 'الرياض', clientN: 'CUST-003', courier: 'LUX EXPRESS', tracking: 'TRK11223', invoice: 'INV-2024-003', cartons: 1 },
  { id: 4, name: 'Fatima Al-Fihri', city: 'Dubai', clientN: 'CUST-004', courier: 'BAHA EXPRESS', tracking: '', invoice: '', cartons: 2 },
  { id: 5, name: 'محمد عبد الله', city: 'القاهرة', clientN: 'CUST-005', courier: 'SAT EXPRESS', tracking: '', invoice: '', cartons: 1 },
  { id: 6, name: 'Peter Jones', city: 'Sydney', clientN: 'CUST-006', courier: 'LUX EXPRESS', tracking: 'TRK44556', invoice: 'INV-2024-006', cartons: 5 },
  { id: 7, name: 'Emily White', city: 'Toronto', clientN: 'CUST-007', courier: 'BAHA EXPRESS', tracking: 'TRK77889', invoice: 'INV-2024-007', cartons: 1 },
];

// Simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getSheetData = async (): Promise<ShippingData[]> => {
  console.log("Mock Service: Fetching sheet data...");
  await delay(500);
  // Return a deep copy to prevent direct mutation of the mock data
  return JSON.parse(JSON.stringify(MOCK_DATA));
};

export const updateSheetData = async (updates: Partial<ShippingData>[]): Promise<void> => {
  console.log("Mock Service: Updating sheet data with:", updates);
  await delay(1000);
  // In a real app, this would send data to the backend.
  // Here we just log it.
  console.log(`${updates.length} rows updated successfully.`);
  return Promise.resolve();
};
