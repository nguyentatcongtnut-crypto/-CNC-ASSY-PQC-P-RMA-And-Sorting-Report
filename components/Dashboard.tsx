
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, ReportRow, MasterData, RMA_Type, ExportHistory } from '../types';
import { INITIAL_MASTER_DATA, COLOR_MAP, WATERMARK } from '../constants';
import { Plus, Trash2, Database, History, FileDown, Upload, MessageCircle, X, Search, AlertTriangle, Calendar as CalendarIcon, Type as TypeIcon, ChevronDown, ChevronUp, MoreVertical, Check } from 'lucide-react';
import ReferenceModal from './ReferenceModal';
import HistoryModal from './HistoryModal';
import ReviewExportModal from './ReviewExportModal';
import ChatWidget from './ChatWidget';
import AbbreviationModal from './AbbreviationModal';
import { extractReportDataFromImage } from '../geminiService';

interface DashboardProps {
  user: User;
}

/**
 * Thành phần Autocomplete thông minh:
 * - Click vào là xóa trắng để nhập mới.
 * - Gợi ý mẫu gần đúng nhất.
 * - Nếu không nhập gì sẽ trả về giá trị cũ.
 */
const SmartAutocomplete: React.FC<{
  value: string;
  suggestions: string[];
  onChange: (val: string) => void;
  placeholder: string;
  className?: string;
  isValid?: boolean;
  style?: React.CSSProperties;
  showChevron?: boolean;
}> = ({ value, suggestions, onChange, placeholder, className, isValid = true, style, showChevron = true }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const [filtered, setFiltered] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) setInputValue(value);
  }, [value, isEditing]);

  const handleFocus = () => {
    setPrevValue(inputValue);
    setInputValue(''); // "Khi nhập vào o data thì data sẽ mất"
    setIsEditing(true);
    setFiltered(suggestions);
  };

  const handleBlur = () => {
    // Timeout để cho phép sự kiện mousedown trên danh sách gợi ý chạy trước
    setTimeout(() => {
      setIsEditing(false);
      if (inputValue.trim() === '') {
        // "nếu không nhập data thì trờ về giá trị trước khi nhấp chuột"
        setInputValue(prevValue);
        onChange(prevValue);
      } else {
        // Nếu nhập giá trị không có trong mẫu, vẫn cho phép hoặc báo đỏ qua prop isValid
        onChange(inputValue);
      }
    }, 200);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    const matches = suggestions.filter(s => 
      s.toLowerCase().includes(val.toLowerCase())
    ).slice(0, 10); // Chỉ hiện 10 gợi ý gần đúng nhất
    setFiltered(matches);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      setInputValue(prevValue);
      setIsEditing(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative w-full group">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={isEditing ? inputValue : value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          style={style}
          className={`${className} pr-6 ${!isValid && value && !isEditing ? 'bg-red-500 text-white border-red-700' : ''}`}
          placeholder={placeholder}
        />
        {showChevron && !isEditing && (
          <ChevronDown size={14} className="absolute right-1 text-gray-400 pointer-events-none group-hover:text-blue-600" />
        )}
      </div>
      
      {isEditing && (
        <div className="absolute left-0 right-0 bottom-full md:top-full bg-white border-2 border-blue-600 z-[100] shadow-2xl max-h-60 overflow-y-auto btn-square mb-1 md:mt-1">
          {filtered.length > 0 ? (
            filtered.map((s, idx) => (
              <div 
                key={idx} 
                onMouseDown={() => {
                  setInputValue(s);
                  onChange(s);
                  setIsEditing(false);
                }}
                className="p-3 md:p-2 text-[13px] md:text-[11px] font-black hover:bg-blue-600 hover:text-white cursor-pointer border-b border-gray-100 last:border-0 uppercase flex justify-between items-center"
              >
                {s}
                {s === value && <Check size={12} />}
              </div>
            ))
          ) : (
            <div className="p-3 text-[10px] text-gray-400 italic">Không có mẫu khớp...</div>
          )}
        </div>
      )}
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [masterData, setMasterData] = useState<MasterData>(INITIAL_MASTER_DATA);
  const [history, setHistory] = useState<ExportHistory[]>([]);
  const [activeModal, setActiveModal] = useState<'ref' | 'history' | 'export' | 'abbrev' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
    delete: 50,
    date: 100,
    vendor: 120,
    model: 120,
    color: 100,
    type: 80,
    input: 80,
    ng: 80,
    rate: 80,
    material: 140,
    defect: 200,
    qty: 80,
    ngType: 100,
    dept: 120,
    remark: 250
  });

  const resizingRef = useRef<{ id: string; startX: number; startWidth: number } | null>(null);

  const onMouseDown = (id: string, e: React.MouseEvent) => {
    resizingRef.current = { id, startX: e.pageX, startWidth: columnWidths[id] };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'col-resize';
  };

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!resizingRef.current) return;
    const { id, startX, startWidth } = resizingRef.current;
    const diff = e.pageX - startX;
    setColumnWidths(prev => ({
      ...prev,
      [id]: Math.max(40, startWidth + diff)
    }));
  }, []);

  const onMouseUp = useCallback(() => {
    resizingRef.current = null;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'default';
  }, [onMouseMove]);

  const handleAddRow = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    
    if (rows.length === 0) {
      const newRow: ReportRow = {
        id: newId,
        model: '',
        color: '',
        type: 'RMA',
        date: new Date().toISOString().split('T')[0],
        shift: masterData.shifts[0] || '1A',
        vendor: masterData.vendors[0] || '',
        input: 0,
        ng: 0,
        material: '',
        defectName: '',
        qtyNg: 0,
        confirmedDept: 'ASSY',
        remark: '',
        rate: 0,
        ngType: 'NG Tape'
      };
      setRows([newRow]);
    } else {
      const lastRow = rows[rows.length - 1];
      const newRow: ReportRow = {
        ...lastRow,
        id: newId,
        input: 0,
        ng: 0,
        qtyNg: 0,
        rate: 0,
        material: '',
        defectName: '',
        remark: ''
      };
      setRows([...rows, newRow]);
    }
  };

  const handleDeleteRow = (id: string) => {
    setRows(rows.filter(r => r.id !== id));
  };

  const expandAbbreviation = (text: string) => {
    if (!text) return text;
    const trimmed = text.trim();
    for (const [key, value] of Object.entries(masterData.abbreviations)) {
      if (key.toLowerCase() === trimmed.toLowerCase()) {
        return value;
      }
    }
    return text;
  };

  const updateRow = (id: string, updates: Partial<ReportRow>) => {
    setRows(rows.map(row => {
      if (row.id !== id) return row;
      const finalUpdates = { ...updates };
      if (finalUpdates.material) finalUpdates.material = expandAbbreviation(finalUpdates.material);
      if (finalUpdates.defectName) finalUpdates.defectName = expandAbbreviation(finalUpdates.defectName);
      const updatedRow = { ...row, ...finalUpdates };
      if (finalUpdates.ng !== undefined || finalUpdates.input !== undefined) {
        updatedRow.rate = updatedRow.input > 0 ? (updatedRow.ng / updatedRow.input) * 100 : 0;
      }
      if (finalUpdates.material !== undefined) {
        updatedRow.ngType = updatedRow.material === 'Front' ? 'NG Front' : 'NG Tape';
      }
      return updatedRow;
    }));
  };

  const handleImportImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const result = await extractReportDataFromImage(base64);
      if (result && Array.isArray(result.rows)) {
        const detectedVendor = result.vendor || masterData.vendors[0] || '';
        const detectedShift = result.shift || masterData.shifts[0] || '1A';
        const newRows = result.rows.map((item: any) => {
           let material = expandAbbreviation(item.material || '');
           let defectName = expandAbbreviation(item.defectName || '');
           let confirmedDept = 'ASSY';
           const ngType = material === 'Front' ? 'NG Front' : 'NG Tape';
           if (defectName && typeof defectName === 'string' && defectName.toUpperCase() === 'SPTT') {
             confirmedDept = 'OutLimit';
           }
           return {
            id: Math.random().toString(36).substr(2, 9),
            model: item.model || '', 
            color: item.color || '', 
            type: (['RMA', 'Sorting', 'Block', 'RW'].includes(item.type) ? item.type : 'RMA') as RMA_Type,
            date: new Date().toISOString().split('T')[0],
            shift: detectedShift,
            vendor: detectedVendor,
            input: Number(item.input) || 0,
            ng: Number(item.ng) || 0,
            material: material,
            defectName: defectName,
            qtyNg: Number(item.qtyNg) || 0,
            confirmedDept: confirmedDept,
            remark: item.remark || '',
            rate: Number(item.input) > 0 ? (Number(item.ng) / Number(item.input)) * 100 : 0,
            ngType: ngType
          };
        }) as ReportRow[];
        for (let i = 1; i < newRows.length; i++) {
          if (!newRows[i].model) newRows[i].model = newRows[i-1].model;
          if (!newRows[i].color) newRows[i].color = newRows[i-1].color;
          if (!newRows[i].type) newRows[i].type = newRows[i-1].type;
          if (!newRows[i].vendor) newRows[i].vendor = newRows[i-1].vendor;
          if (!newRows[i].shift) newRows[i].shift = newRows[i-1].shift;
          if (newRows[i].model === newRows[i-1].model && newRows[i].color === newRows[i-1].color && newRows[i].type === newRows[i-1].type && newRows[i].input === newRows[i-1].input && newRows[i].ng === newRows[i-1].ng) {
            newRows[i].input = 0; newRows[i].ng = 0; newRows[i].rate = 0;
          } else {
            newRows[i].rate = newRows[i].input > 0 ? (newRows[i].ng / newRows[i].input) * 100 : 0;
          }
        }
        setRows([...rows, ...newRows]);
      }
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getHashColor = (str: string) => {
    if (!str) return '#f8fafc';
    let hash = 0;
    for (let i = 0; i < str.length; i++) { hash = str.charCodeAt(i) + ((hash << 5) - hash); }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return "#" + "00000".substring(0, 6 - c.length) + c + "20";
  };

  const ResizableHeaderCell = ({ id, label, className }: { id: string; label: string; className?: string }) => (
    <th style={{ width: columnWidths[id] }} className={`p-3 text-[11px] font-black uppercase text-gray-500 border-r relative group select-none ${className}`}>
      <div className="flex items-center justify-between">{label}</div>
      <div onMouseDown={(e) => onMouseDown(id, e)} className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 active:bg-blue-600 transition-colors z-20" />
    </th>
  );

  const MobileRowCard = ({ row }: { row: ReportRow }) => {
    const defectSuggestions = row.ngType === 'NG Front' ? masterData.defectsFront : masterData.defectsTape;
    
    return (
      <div className="bg-white p-4 border border-gray-200 btn-square shadow-sm mb-4 flex flex-col gap-3 relative">
        <button onClick={() => handleDeleteRow(row.id)} className="absolute top-2 right-2 text-red-500 p-2"><Trash2 size={20} /></button>
        
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase text-gray-400">Vendor</label>
            <SmartAutocomplete 
              value={row.vendor} 
              suggestions={masterData.vendors} 
              onChange={(val) => updateRow(row.id, { vendor: val })} 
              placeholder="--Vendor--"
              className="w-full bg-blue-50/50 p-2 text-xs font-bold btn-square border border-gray-100 outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase text-gray-400">Model</label>
            <SmartAutocomplete 
              value={row.model} 
              suggestions={masterData.models} 
              onChange={(val) => updateRow(row.id, { model: val })} 
              placeholder="--Model--"
              className="w-full bg-blue-50/50 p-2 text-xs font-bold btn-square border border-gray-100 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase text-gray-400">Màu sắc</label>
            <SmartAutocomplete 
              value={row.color} 
              suggestions={masterData.colors} 
              onChange={(val) => updateRow(row.id, { color: val })} 
              placeholder="--Màu--"
              className="w-full p-2 text-xs font-black btn-square border border-gray-100 outline-none"
              style={{ backgroundColor: COLOR_MAP[row.color] || '#ffffff', color: ['Black', 'Blue', 'Navy', 'Red'].includes(row.color) ? 'white' : 'black' }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase text-gray-400">Type</label>
            <SmartAutocomplete 
              value={row.type} 
              suggestions={masterData.types} 
              onChange={(val) => updateRow(row.id, { type: val as RMA_Type })} 
              placeholder="--Type--"
              className="w-full p-2 text-xs font-black btn-square border border-gray-100 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase text-gray-400">Input</label>
            <input type="number" value={row.input || ''} onChange={(e) => updateRow(row.id, { input: Number(e.target.value) })} className="w-full p-2 text-xs btn-square border border-gray-100 font-mono outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase text-gray-400">NG</label>
            <input type="number" value={row.ng || ''} onChange={(e) => updateRow(row.id, { ng: Number(e.target.value) })} className="w-full p-2 text-xs btn-square border border-gray-100 font-bold text-red-600 font-mono outline-none" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase text-gray-400">Material</label>
          <SmartAutocomplete 
            value={row.material} 
            suggestions={masterData.materials} 
            onChange={(val) => updateRow(row.id, { material: val })} 
            placeholder="--Vật liệu--"
            className="w-full p-2 text-xs font-black btn-square border border-gray-100 outline-none text-blue-800"
            isValid={masterData.materials.includes(row.material)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase text-gray-400">Defect Name</label>
          <SmartAutocomplete 
            value={row.defectName} 
            suggestions={defectSuggestions} 
            onChange={(val) => updateRow(row.id, { defectName: val })} 
            placeholder="--Nhập lỗi--"
            className="w-full p-2 text-xs font-black btn-square border border-gray-100 outline-none text-blue-900"
            isValid={defectSuggestions.includes(row.defectName)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase text-gray-400">Q'ty NG</label>
            <input type="number" value={row.qtyNg || ''} onChange={(e) => updateRow(row.id, { qtyNg: Number(e.target.value) })} className={`w-full p-2 text-xs btn-square border font-black outline-none ${row.qtyNg === 0 ? 'bg-red-500 text-white border-red-700' : 'border-gray-100'}`} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase text-gray-400">Dept XN</label>
            <SmartAutocomplete 
              value={row.confirmedDept} 
              suggestions={masterData.departments} 
              onChange={(val) => updateRow(row.id, { confirmedDept: val })} 
              placeholder="--Dept--"
              className="w-full p-2 text-xs font-black btn-square border border-gray-100 outline-none text-blue-900"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 h-full relative">
      {/* Desktop Toolbar */}
      <div className="hidden md:flex flex-wrap gap-3 items-center justify-between bg-white p-4 btn-square border border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="flex gap-3 flex-wrap">
          <button onClick={handleAddRow} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 btn-square hover:bg-blue-700 transition font-bold shadow-sm uppercase text-xs"><Plus size={18} /> Thêm dòng</button>
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-white text-blue-600 border border-blue-600 px-5 py-2.5 btn-square hover:bg-blue-50 transition font-bold text-xs uppercase" disabled={isLoading}><Upload size={18} /> {isLoading ? 'Phân tích...' : 'Import Ảnh'}</button>
          <input type="file" ref={fileInputRef} onChange={handleImportImage} className="hidden" accept="image/*" />
          {user.level === 1 && (
            <div className="flex gap-2">
              <button onClick={() => setActiveModal('ref')} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 btn-square hover:bg-blue-700 transition font-bold shadow-sm text-xs uppercase"><Database size={18} /> Nút Mẫu</button>
              <button onClick={() => setActiveModal('abbrev')} className="flex items-center gap-2 bg-white text-blue-600 border border-blue-600 px-5 py-2.5 btn-square hover:bg-blue-50 transition font-bold text-xs uppercase"><TypeIcon size={18} /> Viết tắt</button>
            </div>
          )}
          <button onClick={() => setActiveModal('history')} className="flex items-center gap-2 bg-blue-100 text-blue-700 px-5 py-2.5 btn-square hover:bg-blue-200 transition font-bold text-xs uppercase"><History size={18} /> History</button>
        </div>
        <button onClick={() => setActiveModal('export')} className="flex items-center gap-2 bg-green-600 text-white px-8 py-2.5 btn-square hover:bg-green-700 transition font-bold shadow-md uppercase text-xs tracking-widest"><FileDown size={18} /> Export Excel</button>
      </div>

      {/* Mobile Toolbar */}
      <div className="md:hidden flex flex-col gap-2 bg-white p-3 border border-gray-200 btn-square shadow-sm sticky top-0 z-30">
        <div className="flex justify-between items-center">
          <button onClick={handleAddRow} className="flex-1 bg-blue-600 text-white py-3 btn-square font-black uppercase text-xs flex items-center justify-center gap-2"><Plus size={20} /> Dòng mới</button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-3 text-blue-600"><MoreVertical size={24} /></button>
        </div>
        {isMobileMenuOpen && (
          <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
            <button onClick={() => { fileInputRef.current?.click(); setIsMobileMenuOpen(false); }} className="w-full text-left py-3 px-2 text-xs font-bold uppercase flex items-center gap-3 text-gray-700 border-b border-gray-50"><Upload size={18} /> Import Ảnh Báo Cáo</button>
            {user.level === 1 && (
              <>
                <button onClick={() => { setActiveModal('ref'); setIsMobileMenuOpen(false); }} className="w-full text-left py-3 px-2 text-xs font-bold uppercase flex items-center gap-3 text-gray-700 border-b border-gray-50"><Database size={18} /> Cài đặt Danh Mục Mẫu</button>
                <button onClick={() => { setActiveModal('abbrev'); setIsMobileMenuOpen(false); }} className="w-full text-left py-3 px-2 text-xs font-bold uppercase flex items-center gap-3 text-gray-700 border-b border-gray-50"><TypeIcon size={18} /> Quản lý Viết Tắt</button>
              </>
            )}
            <button onClick={() => { setActiveModal('history'); setIsMobileMenuOpen(false); }} className="w-full text-left py-3 px-2 text-xs font-bold uppercase flex items-center gap-3 text-gray-700 border-b border-gray-50"><History size={18} /> Lịch sử xuất File</button>
            <button onClick={() => { setActiveModal('export'); setIsMobileMenuOpen(false); }} className="w-full bg-green-600 text-white py-4 font-black uppercase text-sm flex items-center justify-center gap-3 mt-2 shadow-lg"><FileDown size={22} /> XUẤT EXCEL NGAY</button>
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white border border-gray-200 shadow-xl overflow-auto flex-grow min-h-[500px] btn-square">
        <table className="w-full text-left border-collapse table-fixed">
          <thead className="bg-[#f1f5f9] border-b-2 border-blue-600 sticky top-0 z-10">
            <tr>
              <ResizableHeaderCell id="delete" label="Xóa" className="text-center" />
              <ResizableHeaderCell id="date" label="Ngày" />
              <ResizableHeaderCell id="vendor" label="Vendor" />
              <ResizableHeaderCell id="model" label="Model" />
              <ResizableHeaderCell id="color" label="Màu sắc" />
              <ResizableHeaderCell id="type" label="Type" />
              <ResizableHeaderCell id="input" label="Input" />
              <ResizableHeaderCell id="ng" label="NG" />
              <ResizableHeaderCell id="rate" label="Tỷ lệ" className="text-center" />
              <ResizableHeaderCell id="material" label="Material" />
              <ResizableHeaderCell id="defect" label="Defect Name" />
              <ResizableHeaderCell id="qty" label="Q’ty NG" />
              <ResizableHeaderCell id="ngType" label="Loại NG" />
              <ResizableHeaderCell id="dept" label="Bộ phận XN" />
              <ResizableHeaderCell id="remark" label="Remark" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={15} className="p-20 text-center text-gray-300 font-black uppercase text-sm italic">
                  Chưa có dữ liệu. Vui lòng ấn "Thêm dòng" hoặc "Import Ảnh" để bắt đầu.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const defectSuggestions = row.ngType === 'NG Front' ? masterData.defectsFront : masterData.defectsTape;
                return (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                    <td className="p-2 text-center border-r"><button onClick={() => handleDeleteRow(row.id)} className="text-red-400 hover:text-red-600 p-1.5 btn-square transition"><Trash2 size={16} /></button></td>
                    <td className="p-2 border-r"><input type="date" value={row.date} onChange={(e) => updateRow(row.id, { date: e.target.value })} className="w-full bg-transparent border-none p-1 outline-none text-[11px] font-bold btn-square" /></td>
                    <td className="p-2 border-r">
                      <SmartAutocomplete 
                        value={row.vendor} suggestions={masterData.vendors} 
                        onChange={(val) => updateRow(row.id, { vendor: val })} 
                        placeholder="--Vendor--" className="w-full bg-transparent border-none p-1 outline-none text-[11px] font-bold btn-square" 
                      />
                    </td>
                    <td className="p-2 border-r" style={{ backgroundColor: getHashColor(row.model) }}>
                      <SmartAutocomplete 
                        value={row.model} suggestions={masterData.models} 
                        onChange={(val) => updateRow(row.id, { model: val })} 
                        placeholder="--Model--" className="w-full bg-transparent border-none p-1 outline-none text-[11px] font-bold btn-square" 
                      />
                    </td>
                    <td className="p-2 border-r">
                      <SmartAutocomplete 
                        value={row.color} suggestions={masterData.colors} 
                        onChange={(val) => updateRow(row.id, { color: val })} 
                        placeholder="--Màu--" className="w-full text-[11px] font-black p-1 outline-none btn-square"
                        style={{ backgroundColor: COLOR_MAP[row.color] || '#ffffff', color: ['Black', 'Blue', 'Navy', 'Red'].includes(row.color) ? 'white' : 'black' }}
                      />
                    </td>
                    <td className="p-2 border-r" style={{ backgroundColor: getHashColor(row.type) }}>
                      <SmartAutocomplete 
                        value={row.type} suggestions={masterData.types} 
                        onChange={(val) => updateRow(row.id, { type: val as RMA_Type })} 
                        placeholder="--Type--" className="w-full bg-transparent p-1 text-[11px] font-black outline-none btn-square" 
                      />
                    </td>
                    <td className="p-2 border-r"><input type="number" value={row.input || ''} onChange={(e) => updateRow(row.id, { input: Number(e.target.value) })} className="w-full p-1 text-[11px] border border-gray-100 outline-none btn-square text-right font-mono" /></td>
                    <td className="p-2 border-r"><input type="number" value={row.ng || ''} onChange={(e) => updateRow(row.id, { ng: Number(e.target.value) })} className="w-full p-1 text-[11px] border border-gray-100 outline-none btn-square text-right font-bold text-red-600 font-mono" /></td>
                    <td className="p-2 bg-gray-50 font-black text-[11px] text-center border-r text-blue-700">{row.rate > 0 ? row.rate.toFixed(2) : ''}</td>
                    <td className="p-2 border-r">
                      <SmartAutocomplete 
                        value={row.material} suggestions={masterData.materials} 
                        onChange={(val) => updateRow(row.id, { material: val })} 
                        placeholder="--Vật liệu--" className="w-full p-1 text-[11px] outline-none border-none btn-square font-black uppercase text-blue-800"
                        isValid={masterData.materials.includes(row.material)}
                      />
                    </td>
                    <td className="p-2 border-r">
                      <SmartAutocomplete 
                        value={row.defectName} suggestions={defectSuggestions} 
                        onChange={(val) => updateRow(row.id, { defectName: val })} 
                        placeholder="--Nhập lỗi--" className="w-full p-1 text-[11px] outline-none border-none btn-square font-black uppercase text-blue-900"
                        isValid={defectSuggestions.includes(row.defectName)}
                      />
                    </td>
                    <td className="p-2 border-r"><input type="number" value={row.qtyNg || ''} onChange={(e) => updateRow(row.id, { qtyNg: Number(e.target.value) })} className={`w-full p-1 text-[11px] border outline-none btn-square text-right font-black ${row.qtyNg === 0 ? 'bg-red-500 text-white' : ''}`} /></td>
                    <td className="p-2 border-r"><span className={`px-2 py-1 text-[10px] font-black uppercase btn-square block text-center ${row.ngType === 'NG Front' ? 'bg-orange-600 text-white' : 'bg-blue-600 text-white'}`}>{row.ngType}</span></td>
                    <td className="p-2 border-r">
                      <SmartAutocomplete 
                        value={row.confirmedDept} suggestions={masterData.departments} 
                        onChange={(val) => updateRow(row.id, { confirmedDept: val })} 
                        placeholder="--Dept--" className="w-full bg-transparent p-1 text-[11px] font-black outline-none btn-square text-blue-900" 
                      />
                    </td>
                    <td className="p-2"><input type="text" value={row.remark} onChange={(e) => updateRow(row.id, { remark: e.target.value })} className="w-full p-1 text-[11px] border-b border-gray-100 outline-none italic text-gray-400 font-medium" placeholder="..." /></td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden flex-grow overflow-y-auto pb-20">
        {rows.length === 0 ? (
          <div className="bg-white p-10 border border-gray-200 btn-square text-center text-gray-300 font-black uppercase text-xs italic shadow-sm">
            Chưa có dữ liệu. Hãy ấn nút "Dòng mới" để bắt đầu.
          </div>
        ) : (
          rows.map((row) => <MobileRowCard key={row.id} row={row} />)
        )}
      </div>

      <ChatWidget user={user} />
      {activeModal === 'ref' && <ReferenceModal masterData={masterData} setMasterData={setMasterData} onClose={() => setActiveModal(null)} />}
      {activeModal === 'abbrev' && <AbbreviationModal masterData={masterData} setMasterData={setMasterData} onClose={() => setActiveModal(null)} />}
      {activeModal === 'history' && <HistoryModal user={user} history={history} onClose={() => setActiveModal(null)} />}
      {activeModal === 'export' && <ReviewExportModal rows={rows} onClose={() => setActiveModal(null)} onSuccess={(h) => { setHistory([h, ...history]); setActiveModal(null); }} user={user} />}
    </div>
  );
};

export default Dashboard;
