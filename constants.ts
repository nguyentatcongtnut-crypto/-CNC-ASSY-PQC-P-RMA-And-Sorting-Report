
import { MasterData, RMA_Type } from './types';

export const COLORS = {
  primary: '#2563eb', // Blue-600
  secondary: '#eff6ff', // Blue-50
  text: '#1e293b',
};

export const INITIAL_MASTER_DATA: MasterData = {
  models: [
    'B7 Main', 'B7 Sub', 'B7R Sub', 'M1', 'M2', 'M3', 'PA1', 'PA2', 'PA3', 'PS', 'R12', 'R13'
  ].sort(),
  colors: [
    'Black', 'Blue', 'Gold', 'Gray', 'Green', 'Mint', 'Navy', 'Pink', 'Red', 'Violet', 'White', 'Yellow'
  ].sort(),
  types: (['Block', 'RMA', 'RW', 'Sorting'] as RMA_Type[]).sort(),
  materials: [
    'ABS Sub Front', 'ABS UW CAM', 'All Tape', 'BIT', 'BIT UPPER', 'BTM', 'CAM CONN', 'C-Clip', 
    'C-Clip Fix Tape', 'CIC', 'Conductive Front VC', 'CTC Holder', 'DDI', 'DDI MID', 'Deco', 
    'Finger Sensor', 'FOD', 'FPCB', 'Front', 'Front UB', 'GR', 'Guide Hole', 'Hinge Rotate Sus', 
    'Hole Sub Front', 'HR BTM', 'HR TOP', 'INSU Front Hole', 'INSU SCREW HOLE RC', 'L-Pad', 
    'Main UB', 'Main UB BTM', 'Main UB Conn', 'Metal Sheet A', 'Metal Sheet C', 'MID', 'MMP', 
    'Octa Conn', 'PC Sheet 3RD MIC', 'PC Sheet Airvent', 'PC Sheet MIC', 'Protect Gasket', 
    'Screw Hole', 'Sensor FA', 'SHIELD', 'SPCC TOP SPK Assy', 'SPK Mesh Front Main', 
    'Sub Batt FPCB', 'Sub Front BTM', 'T-MTS', 'Tele 3X', 'Tele 5X', 'UB Welding gasket', 
    'USB Cushion', 'UW CAM', 'Vapor Champer', 'VC BTM', 'VC TOP', 'Vinyl', 'VT Cam', 
    'Wide CAM', 'Wide Cam Conn'
  ].sort(),
  defectsTape: [
    'Không có điểm Đen', 'Mixing code', 'NG Bong/ 박리 하다', 'NG Bẩn', 'NG Cháy/ 과용접', 
    'NG Chưa hàn/ 미용접', 'NG chồng/겹친', 'NG Dị Vật', 'NG Dị vật/ 이물', 'NG Đâm/ 충돌', 
    'NG Gập', 'NG Hàn', 'NG Hàn Thiếu', 'NG Hàn Thừa', 'NG Kênh/ 올라탐,이탈', 
    'NG lệch mối Hàn/용접 우', 'NG Lệch/ 틀어짐', 'NG lỗi', 'NG Phòng', 'NG Rách/ 찢어진', 
    'NG Tape', 'NG Thiếu/ 누락', 'NG Trầy', 'Oxi- Hóa', 'Thiếu Keo Dính', 'Thừa Keo', 
    'Thừa Tape', 'Tràn Keo'
  ].sort(),
  defectsFront: [
    'Bavia', 'Bavia Kim Loại', 'Bavia Nhựa', 'Biến Dạng', 'Bong Blasting', 
    'Bong Mạ', 'Bong Sơn', 'Bóng Khí', 'Bẩn', 'Bẩn A', 'Bẩn B', 'Bẩn Khớp Nối', 'Bẩn Mực', 
    'Bẩn keo', 'CNC Mach', 'CNC Phím', 'Chấm Trắng', 'Chặt Damper', 'Chặt Phím', 
    'Chặt hốc Bút', 'Chặt jig', 'Cháy Khớp Nối', 'Chưa Gia Công', 'Chưa Laser Chân bạc', 
    'Chưa Laser Code', 'Chưa Xóa lịch sử Input', 'Chưa bóc tape', 'Cong Vênh', 'Crack', 
    'Crack Khớp nối', 'Crack USB', 'Cắt Sâu', 'Dị Vật', 'Fail DMC', 'Gãy Nhựa', 'Gãy Rear', 
    'Hàn', 'Hở Sáng', 'Keo Bonding', 'Khác Màu', 'Lem', 'Loang', 'Loang Blasting', 
    'Lệch laser', 'Lồi Front', 'Lỗi CNC', 'Lỗi Gia Công', 'Lỗi Khác', 'Lỗi Không Input', 
    'Mixing Code', 'Mè USB', 'Mè phím', 'Mè khớp nối', 'Mẻ', 'Mờ Barcode', 'NG Kích thước', 
    'NG laser', 'Nhám', 'Nứt Khớp Nối', 'Nứt Nhựa', 'Phồng', 'Rộng Hốc Phím', 'Step', 
    'Sứt', 'Sứt MIC', 'Sứt Nhựa', 'Sứt USB', 'Sứt Khớp Nối', 'Thiếu Laser', 'Thiếu Marking', 
    'Thủng', 'Tràn nhựa', 'Trầy', 'Vết Dao', 'Xước', 'Đâm', 'Đâm A', 'Đâm B', 'Đâm C', 
    'Đâm Khớp Nối', 'Đâm Mic', 'Đâm Nhựa', 'Đâm Phím', 'Đâm USB'
  ].sort(),
  departments: [
    '1G', '3G', '4G', 'ASSY', 'BYD', 'EWN', 'Luscase', 'MM', 'OutLimit', 'Tiamai', 'VTL'
  ].sort(),
  vendors: [
    'DA ALL', 'DreamTech', 'Elentec', 'H&S Tech', 'Hadabi', 'ILSUNG', 'KHVatec', 'Sub G'
  ].sort(),
  shifts: ['1A', '2A'].sort(),
  abbreviations: {}
};

export const COLOR_MAP: Record<string, string> = {
  'Black': '#000000',
  'Blue': '#0000FF',
  'Gold': '#FFD700',
  'Gray': '#808080',
  'Green': '#008000',
  'Mint': '#98FF98',
  'Navy': '#000080',
  'Pink': '#FFC0CB',
  'Red': '#FF0000',
  'Violet': '#EE82EE',
  'White': '#FFFFFF',
  'Yellow': '#FFFF00'
};

export const WATERMARK = "Copyright by Nguyễn Tất Công";
