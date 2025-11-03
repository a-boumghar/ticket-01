export const COURIER_OPTIONS = [
  "BAHA EXPRESS",
  "SAT MESSAGERIE",
  "GHAZALA MESSAGERIE",
  "LUX MESSAGERIE",
  "CARRE MESSAGERIE",
  "LA VOIE EXPRESS",
  "FARES TRANSPORT",
  "TRANSPORT PERSONNEL",
  "CAMEO",
  "CTM MESSAGERIE",
  "SUPRATOURS MESSAGERIE"
] as const;

export type Courier = typeof COURIER_OPTIONS[number];

export interface ShippingData {
  id: number;
  name: string;
  fullName: string;
  city: string;
  clientN: string;
  phone: string;
  courier: Courier;
  tracking: string;
  invoice: string;
  cartons: number | string;
}
