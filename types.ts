export const COURIER_OPTIONS = ["BAHA EXPRESS", "SAT EXPRESS", "LUX EXPRESS"] as const;

export type Courier = typeof COURIER_OPTIONS[number];

export interface ShippingData {
  id: number;
  name: string;
  fullName: string;
  city: string;
  clientN: string;
  courier: Courier;
  tracking: string;
  invoice: string;
  cartons: number | string;
}