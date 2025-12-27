
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { User, UserLevel } from './types';
import { WATERMARK } from './constants';
import { LogOut, User as UserIcon, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleLogin = (username: string, level: UserLevel) => {
    setUser({ username, level, fullName: username.toUpperCase() });
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-x-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center shadow-sm sticky top-0 z-40">
        <h1 className="text-sm md:text-xl font-black text-blue-700 uppercase tracking-tight leading-tight">
          <span className="md:inline block">CNC ASSY PQC P</span>
          <span className="text-[10px] md:text-xs font-bold text-gray-400 md:ml-2">RMA & Sorting</span>
        </h1>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] md:text-sm font-black text-gray-700 uppercase truncate max-w-[100px]">{user.fullName}</p>
            <p className="text-[10px] md:text-xs text-blue-600 font-black">LV.{user.level}</p>
          </div>
          <button 
            onClick={() => setIsChangingPassword(true)}
            className="p-2 text-gray-400 hover:text-blue-600 transition"
            title="Đổi mật khẩu"
          >
            <Settings size={20} />
          </button>
          <button 
            onClick={handleLogout}
            className="bg-blue-600 text-white p-2 md:px-4 md:py-2 btn-square hover:bg-blue-700 transition shadow-sm flex items-center gap-2 font-black uppercase text-[10px]"
          >
            <LogOut size={18} className="md:hidden" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-3 md:p-6 overflow-hidden flex flex-col">
        <Dashboard user={user} />
      </main>

      {/* Footer / Watermark - Hidden on small mobile to save space */}
      <footer className="hidden sm:flex bg-white border-t border-gray-200 py-3 px-6 justify-center items-center">
        <p className="text-xs text-gray-400 font-black tracking-widest uppercase">
          {WATERMARK}
        </p>
      </footer>

      {/* Change Password Modal */}
      {isChangingPassword && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-6 btn-square w-full max-w-sm shadow-2xl border-t-4 border-blue-600">
            <h3 className="text-lg font-black mb-4 uppercase text-blue-800">Đổi mật khẩu</h3>
            <div className="space-y-4">
              <input 
                type="password" 
                placeholder="Mật khẩu hiện tại" 
                className="w-full border p-3 input-square outline-none focus:border-blue-500 font-bold text-sm" 
              />
              <input 
                type="password" 
                placeholder="Mật khẩu mới" 
                className="w-full border p-3 input-square outline-none focus:border-blue-500 font-bold text-sm" 
              />
            </div>
            <div className="flex gap-2 mt-6">
              <button 
                onClick={() => setIsChangingPassword(false)}
                className="flex-1 bg-gray-100 py-3 btn-square hover:bg-gray-200 transition font-black uppercase text-xs"
              >
                Hủy
              </button>
              <button 
                onClick={() => setIsChangingPassword(false)}
                className="flex-1 bg-blue-600 text-white py-3 btn-square hover:bg-blue-700 transition font-black uppercase text-xs shadow-lg"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
