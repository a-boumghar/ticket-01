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
  return dataFromSheet.map((row) => ({
    id: row.id,
    fullName: row.FullName || '',
    name: row.Name || '',
    city: row.City || '',
    clientN: row.ClientN || '',
    courier: row.Courier || 'BAHA EXPRESS',
    tracking: row.Tracking || '',
    invoice: row.Invoice || '',
    cartons: row.Cartons || 1,
  }));
};

/**
 * Sends updated row data to the Google Sheet API.
 * This function maps the app's camelCase data keys back to the PascalCase format
 * that the Google Sheet API expects before sending the update.
 */
export const updateSheetData = async (updates: Partial<ShippingData>[]): Promise<void> => {
  console.log("Sending updates to Google Sheets...");

  const updatesForSheet = updates.map(update => {
    const mappedUpdate: { [key: string]: any } = {};
    // This dynamically maps camelCase keys from the app to the PascalCase keys the sheet expects.
    for (const key in update) {
        if (Object.prototype.hasOwnProperty.call(update, key)) {
            const value = (update as any)[key];
            if (key === 'id') {
                mappedUpdate.id = value;
            } else if (key === 'clientN') {
                mappedUpdate.ClientN = value;
            } else {
                const pascalCaseKey = key.charAt(0).toUpperCase() + key.slice(1);
                mappedUpdate[pascalCaseKey] = value;
            }
        }
    }
    return mappedUpdate;
  });

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatesForSheet),
  });

  if (!res.ok) throw new Error("Failed to update data");
  const result = await res.json();
  if (!result.success) throw new Error(result.error || "An unknown error occurred while saving.");
  
  console.log("✅ Updated successfully:", result);
};
