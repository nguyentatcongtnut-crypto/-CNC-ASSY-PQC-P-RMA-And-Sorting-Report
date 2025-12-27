
import React, { useState, useRef } from 'react';
import { MasterData } from '../types';
import { X, Plus, Trash2, Save, Type as TypeIcon, FileUp, FileDown } from 'lucide-react';

interface AbbreviationModalProps {
  masterData: MasterData;
  setMasterData: React.Dispatch<React.SetStateAction<MasterData>>;
  onClose: () => void;
}

const AbbreviationModal: React.FC<AbbreviationModalProps> = ({ masterData, setMasterData, onClose }) => {
  const [localAbbrevs, setLocalAbbrevs] = useState<Record<string, string>>({ ...masterData.abbreviations });
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (!newKey.trim() || !newValue.trim()) return;
    setLocalAbbrevs({ ...localAbbrevs, [newKey.trim()]: newValue.trim() });
    setNewKey('');
    setNewValue('');
  };

  const handleRemove = (key: string) => {
    const updated = { ...localAbbrevs };
    delete updated[key];
    setLocalAbbrevs(updated);
  };

  const handleSave = () => {
    setMasterData({ ...masterData, abbreviations: localAbbrevs });
    onClose();
  };

  const handleExportExcel = () => {
    const data = Object.entries(localAbbrevs).map(([key, val]) => ({
      'Ký tự viết tắt': key,
      'Giá trị đầy đủ': val
    }));
    
    if (data.length === 0) {
      alert("Không có dữ liệu để xuất!");
      return;
    }

    const worksheet = (window as any).XLSX.utils.json_to_sheet(data);
    const workbook = (window as any).XLSX.utils.book_new();
    (window as any).XLSX.utils.book_append_sheet(workbook, worksheet, "Abbreviations");
    (window as any).XLSX.writeFile(workbook, `Danh_sach_viet_tat.xlsx`);
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
        
        const imported: Record<string, string> = { ...localAbbrevs };
        let count = 0;

        json.forEach((row: any) => {
          const keys = Object.keys(row);
          const key = String(row[keys[0]] || '').trim();
          const val = String(row[keys[1]] || '').trim();
          
          if (key && val) {
            imported[key] = val;
            count++;
          }
        });

        setLocalAbbrevs(imported);
        alert(`Đã import thành công ${count} mục viết tắt.`);
      } catch (err) {
        alert("Lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng.");
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
      <div className="bg-white w-full max-w-3xl flex flex-col btn-square shadow-2xl border-t-4 border-blue-600 max-h-[85vh]">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-blue-600 text-white">
          <h2 className="text-lg font-bold flex items-center gap-2 uppercase tracking-tight">
            <TypeIcon size={20} /> QUẢN LÝ VIẾT TẮT (MATERIAL & DEFECT)
          </h2>
          <button onClick={onClose} className="hover:bg-blue-700 p-1 btn-square transition"><X /></button>
        </div>

        <div className="p-4 bg-blue-50 border-b border-blue-100">
          <p className="text-[10px] text-blue-700 font-black mb-3 uppercase italic tracking-wider">
            * Thêm ký tự viết tắt để hệ thống tự động điền thông tin đầy đủ khi import ảnh hoặc nhập tay.
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Từ viết tắt (vd: BT)" 
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="flex-1 p-2 text-xs border border-gray-300 input-square outline-none focus:border-blue-600 font-bold uppercase"
              />
              <input 
                type="text" 
                placeholder="Giá trị đầy đủ (vd: Bẩn Tape)" 
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="flex-[2] p-2 text-xs border border-gray-300 input-square outline-none focus:border-blue-600 font-bold"
              />
              <button 
                onClick={handleAdd}
                className="bg-blue-600 text-white px-6 py-2 btn-square font-black hover:bg-blue-700 transition flex items-center gap-1 text-xs uppercase"
              >
                <Plus size={16} /> THÊM
              </button>
            </div>
            
            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-white text-blue-600 border border-blue-600 px-4 py-2 btn-square font-bold hover:bg-blue-50 transition flex items-center gap-1 text-[10px] uppercase shadow-sm"
              >
                <FileUp size={14} /> IMPORT EXCEL
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".xlsx, .xls" 
                onChange={handleImportExcel} 
              />
              <button 
                onClick={handleExportExcel}
                className="bg-white text-blue-600 border border-blue-600 px-4 py-2 btn-square font-bold hover:bg-blue-50 transition flex items-center gap-1 text-[10px] uppercase shadow-sm"
              >
                <FileDown size={14} /> EXPORT EXCEL
              </button>
            </div>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-4 bg-white custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="p-2 text-[11px] font-black uppercase text-gray-500 w-1/3">Ký tự viết tắt</th>
                <th className="p-2 text-[11px] font-black uppercase text-gray-500">Giá trị đầy đủ</th>
                <th className="p-2 text-[11px] font-black uppercase text-gray-500 w-16 text-center">Xóa</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(localAbbrevs).length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-16 text-center text-gray-300 font-black uppercase text-xs italic">
                    Chưa có thiết lập viết tắt nào.
                  </td>
                </tr>
              ) : (
                Object.entries(localAbbrevs).sort((a,b) => a[0].localeCompare(b[0])).map(([key, val]) => (
                  <tr key={key} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                    <td className="p-2 text-xs font-black text-blue-800 uppercase">{key}</td>
                    <td className="p-2 text-xs font-bold text-gray-700">{val}</td>
                    <td className="p-2 text-center">
                      <button 
                        onClick={() => handleRemove(key)} 
                        className="text-red-300 hover:text-red-600 p-1.5 btn-square transition-colors"
                        title="Xóa mục này"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shadow-inner">
          <button 
            onClick={onClose} 
            className="px-6 py-2 bg-white border border-gray-300 font-bold btn-square hover:bg-gray-100 transition text-gray-600 uppercase text-[10px]"
          >
            HUỶ
          </button>
          <button 
            onClick={handleSave} 
            className="px-10 py-2 bg-blue-600 text-white font-black btn-square hover:bg-blue-700 shadow-lg transition-transform active:scale-95 uppercase text-[10px] tracking-widest"
          >
            LƯU CẤU HÌNH
          </button>
        </div>
      </div>
    </div>
  );
};

export default AbbreviationModal;
