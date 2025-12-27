
import React, { useState } from 'react';
import { User, ExportHistory } from '../types';
// Fixed: Added missing History icon import
import { X, Search, FileDown, Calendar, History } from 'lucide-react';

interface HistoryModalProps {
  user: User;
  history: ExportHistory[];
  onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ user, history, onClose }) => {
  const [searchDate, setSearchDate] = useState('');

  const filteredHistory = history.filter(item => {
    const matchesUser = user.level === 3 ? item.exportedBy === user.username : true;
    const matchesDate = searchDate ? item.exportedAt.includes(searchDate) : true;
    return matchesUser && matchesDate;
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-5xl max-h-[85vh] flex flex-col btn-square shadow-2xl">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-blue-600 text-white">
          <h2 className="text-lg font-bold uppercase tracking-tight flex items-center gap-2">
            <History size={20} /> LỊCH SỬ XUẤT FILE EXCEL
          </h2>
          <button onClick={onClose} className="hover:bg-blue-700 p-1 btn-square"><X /></button>
        </div>

        <div className="p-4 bg-gray-50 border-b flex items-center gap-4">
          <div className="relative flex-grow max-w-xs">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="date" 
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 input-square text-sm outline-none focus:border-blue-500"
            />
          </div>
          <p className="text-xs text-gray-500 font-medium italic">
            * Hiển thị danh sách các báo cáo đã xuất trong hệ thống.
          </p>
        </div>

        <div className="flex-grow overflow-auto p-4">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="p-3 text-xs font-bold uppercase text-gray-600 border-b">Tên File</th>
                <th className="p-3 text-xs font-bold uppercase text-gray-600 border-b">Người xuất</th>
                <th className="p-3 text-xs font-bold uppercase text-gray-600 border-b">Thời gian</th>
                <th className="p-3 text-xs font-bold uppercase text-gray-600 border-b text-center">Tải về</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-gray-400 italic">Không có dữ liệu lịch sử nào được tìm thấy.</td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-3 text-sm font-medium text-blue-700">{item.fileName}</td>
                    <td className="p-3 text-sm text-gray-600 uppercase font-bold">{item.exportedBy}</td>
                    <td className="p-3 text-sm text-gray-500">{new Date(item.exportedAt).toLocaleString()}</td>
                    <td className="p-3 text-center">
                      <button className="text-blue-600 hover:text-blue-800 transition">
                        <FileDown size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-gray-50 text-right">
          <button onClick={onClose} className="px-8 py-2 bg-blue-600 text-white font-bold btn-square hover:bg-blue-700">ĐÓNG</button>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
