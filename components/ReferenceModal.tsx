
import React, { useState, useRef } from 'react';
import { MasterData } from '../types';
import { X, Save, FileUp, FileDown as FileDownIcon, Plus, Trash2, Edit2, Check, Database, AlertCircle } from 'lucide-react';

interface ReferenceModalProps {
  masterData: MasterData;
  setMasterData: React.Dispatch<React.SetStateAction<MasterData>>;
  onClose: () => void;
}

const ReferenceModal: React.FC<ReferenceModalProps> = ({ masterData, setMasterData, onClose }) => {
  type ListableMasterDataKey = Exclude<keyof MasterData, 'abbreviations'>;

  const [localData, setLocalData] = useState<MasterData>({ ...masterData });
  const [activeTab, setActiveTab] = useState<ListableMasterDataKey>('models');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabKeys: ListableMasterDataKey[] = [
    'models',
    'colors',
    'shifts',
    'vendors',
    'departments',
    'types',
    'materials',
    'defectsTape',
    'defectsFront'
  ];

  const tabNames: Record<ListableMasterDataKey, string> = {
    models: 'Model',
    colors: 'Color',
    shifts: 'Shift',
    vendors: 'Vendor',
    departments: 'Bộ Phận Xác Nhận',
    types: 'Type',
    materials: 'Material',
    defectsTape: 'Defect Name (NG Tape)',
    defectsFront: 'Defect Name (NG Front)'
  };

  const excelHeaderMap: Record<string, ListableMasterDataKey> = {
    'Model': 'models',
    'Color': 'colors',
    'Shift': 'shifts',
    'Vendor': 'vendors',
    'Bộ Phận Xác Nhận': 'departments',
    'Type': 'types',
    'Material': 'materials',
    'Defect Name (NG Tape)': 'defectsTape',
    'Defect Name (NG Front)': 'defectsFront'
  };

  const addItem = () => {
    const newItem = prompt(`Thêm mục mới vào ${tabNames[activeTab]}:`);
    if (newItem && newItem.trim()) {
      const currentItems = [...(localData[activeTab] as string[])];
      if (!currentItems.includes(newItem.trim())) {
        const updatedData = { ...localData, [activeTab]: [...currentItems, newItem.trim()] };
        setLocalData(updatedData);
      }
    }
  };

  const removeItem = (index: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa mục này?')) {
      const currentItems = [...(localData[activeTab] as string[])];
      currentItems.splice(index, 1);
      const updatedData = { ...localData, [activeTab]: currentItems };
      setLocalData(updatedData);
      setEditingIndex(null);
    }
  };

  const startEdit = (index: number, value: string) => {
    setEditingIndex(index);
    setEditValue(value);
  };

  const saveEdit = (index: number) => {
    if (!editValue.trim()) return;
    const currentItems = [...(localData[activeTab] as string[])];
    currentItems[index] = editValue.trim();
    const updatedData = { ...localData, [activeTab]: currentItems };
    setLocalData(updatedData);
    setEditingIndex(null);
  };

  const handleSaveAll = () => {
    setMasterData(localData);
    onClose();
  };

  const handleExportExcel = () => {
    const maxLength = Math.max(...tabKeys.map(key => (localData[key] as string[]).length));
    const exportRows = [];

    for (let i = 0; i < maxLength; i++) {
      exportRows.push({
        'Model': (localData.models[i] || ''),
        'Color': (localData.colors[i] || ''),
        'Shift': (localData.shifts[i] || ''),
        'Vendor': (localData.vendors[i] || ''),
        'Loại NG': (i === 0 ? 'NG Front' : i === 1 ? 'NG Tape' : ''),
        'Bộ Phận Xác Nhận': (localData.departments[i] || ''),
        'Type': (localData.types[i] || ''),
        'Material': (localData.materials[i] || ''),
        'Defect Name (NG Tape)': (localData.defectsTape[i] || ''),
        'Defect Name (NG Front)': (localData.defectsFront[i] || '')
      });
    }

    const worksheet = (window as any).XLSX.utils.json_to_sheet(exportRows);
    const workbook = (window as any).XLSX.utils.book_new();
    (window as any).XLSX.utils.book_append_sheet(workbook, worksheet, "SystemTemplate");
    (window as any).XLSX.writeFile(workbook, `[CNC_ASSY_PQC_P]_Form_Mau_He_Thong.xlsx`);
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = (window as any).XLSX.read(bstr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = (window as any).XLSX.utils.sheet_to_json(worksheet);
        
        const newData: MasterData = { ...localData };
        tabKeys.forEach(key => { (newData[key] as string[]) = []; });

        json.forEach((row: any) => {
          Object.entries(excelHeaderMap).forEach(([header, key]) => {
            const val = String(row[header] || '').trim();
            if (val && !(newData[key] as string[]).includes(val)) {
              (newData[key] as string[]).push(val);
            }
          });
        });

        setLocalData(newData);
        alert(`Đã import thành công toàn bộ danh mục mẫu.`);
      } catch (err) {
        alert("Lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng file mẫu.");
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 font-sans">
      <div className="bg-white w-full max-w-6xl h-[85vh] flex flex-col btn-square shadow-2xl border-t-4 border-blue-600">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-blue-600 text-white">
          <h2 className="text-lg font-bold flex items-center gap-2 uppercase tracking-tight">
            <Database size={20} /> THIẾT LẬP DANH MỤC MẪU HỆ THỐNG
          </h2>
          <button onClick={onClose} className="hover:bg-blue-700 p-1 btn-square transition"><X /></button>
        </div>

        <div className="flex flex-grow overflow-hidden">
          <div className="w-72 border-r bg-gray-50 flex flex-col p-2 overflow-y-auto gap-1">
            {tabKeys.map((key) => (
              <button
                key={key}
                onClick={() => { setActiveTab(key); setEditingIndex(null); }}
                className={`w-full text-left px-4 py-3 text-[11px] font-black uppercase btn-square transition border-l-4 shadow-sm mb-1 ${activeTab === key ? 'bg-blue-600 text-white border-blue-900 translate-x-1' : 'bg-white hover:bg-gray-100 text-gray-600 border-gray-200'}`}
              >
                {tabNames[key]}
              </button>
            ))}
          </div>

          <div className="flex-grow flex flex-col p-6 overflow-hidden">
            <div className="flex flex-wrap gap-4 justify-between items-start mb-6 border-b pb-4 border-gray-100">
              <div className="min-w-[200px]">
                <h3 className="text-2xl font-black uppercase text-blue-800 tracking-tighter">{tabNames[activeTab]}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">Quản lý các giá trị lựa chọn</p>
              </div>
              
              <div className="flex gap-2">
                <button onClick={addItem} className="bg-blue-600 text-white px-5 py-2.5 text-xs font-black btn-square hover:bg-blue-700 transition flex items-center gap-2 shadow-sm uppercase">
                  <Plus size={16} /> Thêm mới
                </button>
                <div className="w-px h-10 bg-gray-200 mx-2"></div>
                <button onClick={() => fileInputRef.current?.click()} className="bg-white text-blue-600 border-2 border-blue-600 px-4 py-2 text-xs font-black btn-square hover:bg-blue-50 transition flex items-center gap-2 uppercase">
                  <FileUp size={16} /> Import Toàn Bộ
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleImportExcel} />
                <button onClick={handleExportExcel} className="bg-green-600 text-white px-5 py-2 text-xs font-black btn-square hover:bg-green-700 transition flex items-center gap-2 shadow-md uppercase">
                  <FileDownIcon size={16} /> Export File Mẫu
                </button>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(localData[activeTab] as string[]).map((item, idx) => (
                  <div key={`${activeTab}-${idx}`} className="flex justify-between items-center p-3 border border-gray-200 bg-white group btn-square hover:border-blue-400 hover:shadow-md transition-all">
                    {editingIndex === idx ? (
                      <div className="flex-grow flex gap-1">
                        <input autoFocus type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveEdit(idx)} className="w-full text-sm border-b-2 border-blue-600 outline-none p-0 bg-transparent font-bold text-blue-700" />
                        <button onClick={() => saveEdit(idx)} className="text-green-600 p-1 hover:bg-green-50 btn-square"><Check size={18} /></button>
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-gray-700 truncate">{item}</span>
                    )}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => startEdit(idx, item)} className="text-blue-400 hover:text-blue-600 p-1.5 btn-square hover:bg-blue-50"><Edit2 size={16} /></button>
                      <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 p-1.5 btn-square hover:bg-red-50"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shadow-inner">
          <button onClick={onClose} className="px-8 py-2.5 bg-white border border-gray-300 font-bold btn-square hover:bg-gray-100 transition text-gray-600 uppercase text-xs">Hủy bỏ</button>
          <button onClick={handleSaveAll} className="px-12 py-2.5 bg-blue-600 text-white font-black btn-square hover:bg-blue-700 shadow-lg uppercase text-xs tracking-widest">Lưu tất cả thay đổi</button>
        </div>
      </div>
    </div>
  );
};

export default ReferenceModal;
