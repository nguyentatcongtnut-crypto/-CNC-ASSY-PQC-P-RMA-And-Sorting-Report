
export type UserLevel = 1 | 2 | 3;

export interface User {
  username: string;
  level: UserLevel;
  fullName: string;
}

export type RMA_Type = 'RMA' | 'Sorting' | 'Block' | 'RW';

export interface ReportRow {
  id: string;
  model: string;
  color: string;
  type: RMA_Type;
  date: string;
  shift: string;
  vendor: string;
  input: number;
  ng: number;
  material: string;
  defectName: string;
  qtyNg: number;
  confirmedDept: string;
  remark: string;
  // Computed fields (not directly editable)
  rate: number; 
  ngType: 'NG Front' | 'NG Tape';
}

export interface MasterData {
  models: string[];
  colors: string[];
  types: RMA_Type[];
  materials: string[];
  defectsFront: string[];
  defectsTape: string[];
  departments: string[];
  vendors: string[];
  shifts: string[];
  // Bảng viết tắt: key là từ viết tắt, value là từ đầy đủ
  abbreviations: Record<string, string>;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
}

export interface ExportHistory {
  id: string;
  fileName: string;
  exportedBy: string;
  exportedAt: string;
  data: ReportRow[];
}
