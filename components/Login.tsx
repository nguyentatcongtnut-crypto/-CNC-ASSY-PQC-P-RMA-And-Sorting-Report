
import React, { useState } from 'react';
import { UserLevel } from '../types';
import { Eye, EyeOff, Lock, User as UserIcon } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string, level: UserLevel) => void;
}

// Danh sách tài khoản được trích xuất từ bảng
const VALID_USERS = [
  { username: 'Congk46kc04', password: 'Cong03039@', level: 1 as UserLevel },
  { username: 'Leader 1A', password: 'abc13579', level: 2 as UserLevel },
  { username: 'Leader 2A', password: 'abc13579', level: 2 as UserLevel },
  { username: 'Elentec1A', password: 'abc13579', level: 3 as UserLevel },
  { username: 'Elentec2A', password: 'abc13579', level: 3 as UserLevel },
  { username: 'H&STech1A', password: 'abc13579', level: 3 as UserLevel },
  { username: 'H&STech2A', password: 'abc13579', level: 3 as UserLevel },
  { username: 'ILSUNG1A', password: 'abc13579', level: 3 as UserLevel },
  { username: 'ILSUNG2A', password: 'abc13579', level: 3 as UserLevel },
  { username: 'SRTech1A', password: 'abc13579', level: 3 as UserLevel },
  { username: 'SRTech2A', password: 'abc13579', level: 3 as UserLevel },
  { username: 'KHVatec1A', password: 'abc13579', level: 3 as UserLevel },
  { username: 'KHVatec2A', password: 'abc13579', level: 3 as UserLevel },
  { username: 'DreamTech1A', password: 'abc13579', level: 3 as UserLevel },
  { username: 'DreamTech2A', password: 'abc13579', level: 3 as UserLevel },
  { username: 'DAALL1A', password: 'abc13579', level: 3 as UserLevel },
  { username: 'DAALL2A', password: 'abc13579', level: 3 as UserLevel },
];

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const lowerInputUser = username.toLowerCase().trim();
    const lowerInputPass = password.toLowerCase().trim();

    // Tìm kiếm trong danh sách (không phân biệt hoa thường)
    const foundUser = VALID_USERS.find(
      u => u.username.toLowerCase() === lowerInputUser && 
           u.password.toLowerCase() === lowerInputPass
    );
    
    if (foundUser) {
      setError('');
      onLogin(foundUser.username, foundUser.level);
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không chính xác');
    }
  };

  return (
    <div className="min-h-screen bg-blue-600 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-md shadow-2xl overflow-hidden btn-square border-t-8 border-blue-900">
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-100 flex items-center justify-center btn-square mb-4 shadow-inner">
              <Lock className="text-blue-600" size={32} />
            </div>
            <h2 className="text-2xl font-black text-gray-800 text-center tracking-tighter uppercase">[CNC ASSY PQC P]</h2>
            <p className="text-gray-500 text-xs font-bold mt-1 uppercase tracking-widest">RMA & Sorting Report System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-gray-700 mb-1.5 uppercase">Tên Đăng Nhập</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600">
                  <UserIcon size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 input-square focus:ring-1 focus:ring-blue-500 focus:border-blue-600 outline-none text-sm font-semibold transition-all"
                  placeholder="Username..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-700 mb-1.5 uppercase">Mật Khẩu</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 input-square focus:ring-1 focus:ring-blue-500 focus:border-blue-600 outline-none text-sm font-semibold transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-2">
                <p className="text-red-600 text-[11px] font-bold uppercase">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3.5 font-black btn-square hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
            >
              Đăng nhập hệ thống
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center text-[9px] text-gray-400 uppercase font-black tracking-widest">
            <span>Copyright © 2024</span>
            <span className="text-blue-400">Nguyễn Tất Công</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
