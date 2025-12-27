
import React, { useState } from 'react';
import { ReportRow, User, ExportHistory } from '../types';
import { X, Check, AlertCircle } from 'lucide-react';
import { WATERMARK } from '../constants';

interface ReviewExportModalProps {
  rows: ReportRow[];
  user: User;
  onClose: () => void;
  onSuccess: (exported: ExportHistory) => void;
}

const ReviewExportModal: React.FC<ReviewExportModalProps> = ({ rows, user, onClose, onSuccess }) => {
  const [editableRows, setEditableRows] = useState<ReportRow[]>([...rows]);

  const handleExport = () => {
    const firstRow = editableRows[0];
    const vendor = firstRow?.vendor || 'N/A';
    const shift = firstRow?.shift || 'N/A';
    const dateStr = firstRow?.date || new Date().toISOString().split('T')[0];
    const fileName = `[CNC ASSY PQC P] Báo cáo RMA và Sorting vendor ${vendor} Shift ${shift} Ngày ${dateStr}.xlsx`;

    const dataForExport = editableRows.map((row, index) => {
      const isRMAorSorting = row.type === 'RMA' || row.type === 'Sorting';
      
      // Form Xuất ra phải có đúng tên, thứ tự các cột như sau: 
      // Model, Color, Date, Shift, Vendor, Input, Loại NG, Material, Defect Name, Q’ty NG RMA_Soritng, Block, RW_OK, Type, Bộ phận xác nhận, Remark.
      return {
        'STT': index + 1,
        'Model': row.model,
        'Color': row.color,
        'Date': row.date,
        'Shift': row.shift,
        'Vendor': row.vendor,
        'Input': row.input > 0 ? row.input : '',
        'Loại NG': row.ngType,
        'Material': row.material,
        'Defect Name': row.defectName,
        'Q’ty NG RMA_Soritng': isRMAorSorting ? row.qtyNg : '',
        'Block': row.type === 'Block' ? row.qtyNg : '',
        'RW_OK': row.type === 'RW' ? row.qtyNg : '',
        'Type': row.type,
        'Bộ phận xác nhận': row.confirmedDept,
        'Remark': row.remark,
        'Watermark': WATERMARK
      };
    });

    const worksheet = (window as any).XLSX.utils.json_to_sheet(dataForExport);
    const workbook = (window as any).XLSX.utils.book_new();
    (window as any).XLSX.utils.book_append_sheet(workbook, worksheet, "Report Data");
    (window as any).XLSX.writeFile(workbook, fileName);

    onSuccess({
      id: Math.random().toString(36).substr(2, 9),
      fileName,
      exportedBy: user.username,
      exportedAt: new Date().toISOString(),
      data: editableRows
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white w-full max-w-7xl max-h-[90vh] flex flex-col btn-square shadow-2xl border-t-4 border-green-600">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-green-600 text-white">
          <h2 className="text-lg font-black flex items-center gap-2 uppercase tracking-tight">
            <Check size={20} /> KIỂM TRA DỮ LIỆU CUỐI CÙNG
          </h2>
          <button onClick={onClose} className="hover:bg-green-700 p-1 btn-square transition"><X /></button>
        </div>

        <div className="p-3 bg-yellow-50 text-yellow-700 text-xs flex items-center gap-2 font-black uppercase italic">
          <AlertCircle size={14} /> Kiểm tra kỹ trước khi xuất File Excel chính thức.
        </div>

        <div className="flex-grow overflow-auto p-4 bg-gray-50">
           <table className="w-full text-left border-collapse text-[11px] min-w-[1400px] bg-white shadow-sm">
            <thead className="bg-gray-100 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="p-2 font-black uppercase text-gray-500 border-r">Model</th>
                <th className="p-2 font-black uppercase text-gray-500 border-r">Color</th>
                <th className="p-2 font-black uppercase text-gray-500 border-r">Date</th>
                <th className="p-2 font-black uppercase text-gray-500 border-r">Shift</th>
                <th className="p-2 font-black uppercase text-gray-500 border-r">Vendor</th>
                <th className="p-2 font-black uppercase text-gray-500 border-r text-right">Input</th>
                <th className="p-2 font-black uppercase text-gray-500 border-r">Loại NG</th>
                <th className="p-2 font-black uppercase text-gray-500 border-r">Material</th>
                <th className="p-2 font-black uppercase text-gray-500 border-r">Defect Name</th>
                <th className="p-2 font-black uppercase text-gray-500 border-r text-right">Q’ty RMA/Sort</th>
                <th className="p-2 font-black uppercase text-gray-500 border-r text-right">Block</th>
                <th className="p-2 font-black uppercase text-gray-500 border-r text-right">RW_OK</th>
                <th className="p-2 font-black uppercase text-gray-500 border-r">Type</th>
                <th className="p-2 font-black uppercase text-gray-500 border-r">Bộ phận XN</th>
                <th className="p-2 font-black uppercase text-gray-500">Remark</th>
              </tr>
            </thead>
            <tbody>
              {editableRows.map((row, idx) => (
                <tr key={row.id} className="border-b hover:bg-blue-50 transition-colors">
                  <td className="p-1 border-r font-bold text-blue-900">{row.model}</td>
                  <td className="p-1 border-r font-bold">{row.color}</td>
                  <td className="p-1 border-r font-bold">{row.date}</td>
                  <td className="p-1 border-r font-bold">{row.shift}</td>
                  <td className="p-1 border-r font-bold">{row.vendor}</td>
                  <td className="p-1 border-r text-right font-mono">{row.input || ''}</td>
                  <td className="p-1 border-r font-black text-blue-600">{row.ngType}</td>
                  <td className="p-1 border-r uppercase font-bold text-gray-600">{row.material}</td>
                  <td className="p-1 border-r uppercase font-black text-blue-800">{row.defectName}</td>
                  <td className="p-1 border-r text-right font-black">{(row.type === 'RMA' || row.type === 'Sorting') ? row.qtyNg : ''}</td>
                  <td className="p-1 border-r text-right font-black">{row.type === 'Block' ? row.qtyNg : ''}</td>
                  <td className="p-1 border-r text-right font-black">{row.type === 'RW' ? row.qtyNg : ''}</td>
                  <td className="p-1 border-r font-bold">{row.type}</td>
                  <td className="p-1 border-r font-bold text-orange-600">{row.confirmedDept}</td>
                  <td className="p-1 italic text-gray-400">{row.remark}</td>
                </tr>
              ))}
            </tbody>
           </table>
        </div>

        <div className="p-4 bg-white border-t border-gray-100 flex justify-between items-center">
          <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest italic">{WATERMARK}</div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-8 py-2.5 bg-white border border-gray-300 font-bold btn-square hover:bg-gray-100 transition text-gray-600 uppercase text-xs">Quay lại sửa</button>
            <button onClick={handleExport} className="px-12 py-2.5 bg-green-600 text-white font-black btn-square hover:bg-green-700 shadow-lg active:scale-95 transition-transform uppercase text-xs tracking-widest">Xác nhận xuất file Excel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewExportModal;
