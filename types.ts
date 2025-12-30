
export type Language = 'ar' | 'en';
export type Theme = 'light' | 'dark';
export type AppMode = 'qr' | 'barcode' | 'select';

export enum QRType {
  URL = 'URL',
  TEXT = 'TEXT',
  WIFI = 'WIFI',
  EMAIL = 'EMAIL',
  CALL = 'CALL',
  SMS = 'SMS',
  VCARD = 'VCARD'
}

export interface QRConfig {
  value: string;
  fgColor: string;
  bgColor: string;
  size: number;
  includeMargin: boolean;
  level: 'L' | 'M' | 'Q' | 'H';
}

export interface BarcodeConfig {
  symbology: string;
  text: string;
  scale: number;
  height: number;
  includetext: boolean;
  guardwhitespace: boolean;
}

export interface Translation {
  title: string;
  subtitle: string;
  qrTool: string;
  barcodeTool: string;
  selectTool: string;
  link: string;
  text: string;
  wifi: string;
  email: string;
  call: string;
  sms: string;
  vcard: string;
  data: string;
  design: string;
  fgColor: string;
  bgColor: string;
  removeMargin: string;
  downloadQuality: string;
  downloadBtn: string;
  placeholderUrl: string;
  placeholderText: string;
  placeholderPhone: string;
  ssid: string;
  password: string;
  encryption: string;
  subject: string;
  body: string;
  firstName: string;
  lastName: string;
  org: string;
  low: string;
  high: string;
  ultra: string;
  max: string;
  livePreview: string;
  lightMode: string;
  darkMode: string;
  barcodeSymbology: string;
  barcodeValue: string;
  showText: string;
  barcodeDesc: string;
}
