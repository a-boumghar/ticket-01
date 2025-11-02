
import type { ShippingData } from '../types';

const API_URL = 'https://script.google.com/macros/s/AKfycby1BWL68F00BHr3V0ax9wSnnbuGFy2j5bGr9eOTBIZoiRvL0QI772L8r8qeJuv0Pvsd/exec';

/**
 * Fetches shipping data from the Google Sheet API.
 * The Google Sheet uses PascalCase headers (e.g., "FullName"), but the app expects
 * camelCase (e.g., "fullName"). This function fetches the data and maps the keys
 * to the format the application expects.
 */
export const getSheetData = async (): Promise<ShippingData[]> => {
  console.log("Fetching sheet data from Google Sheets...");
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch data");
  const dataFromSheet: any[] = await res.json();

  // Map the raw data keys from PascalCase (Sheet) to camelCase (App)
  return dataFromSheet.map((row, index) => ({
    // FIX: Ensure a unique ID for each row to prevent React rendering bugs.
    // It prioritizes an ID from the sheet (checking for 'Id' and 'id') but
    // falls back to the array index if no ID is provided.
    id: row.Id ?? row.id ?? index,
    fullName: String(row.FullName || ''),
    name: String(row.Name || ''),
    city: String(row.City || ''),
    clientN: String(row.ClientN || ''),
    courier: row.Courier || 'BAHA EXPRESS',
    tracking: String(row.Tracking || ''),
    invoice: String(row.Invoice || ''),
    cartons: Number(row.Cartons) || '',
  }));
};
