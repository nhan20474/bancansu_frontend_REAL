import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 🎯 Kiểu dữ liệu người dùng
export interface User {
  name: string;
  email: string;
  avatar?: string;
}

// 📦 Kiểu dữ liệu context
interface UserContextType {
  user?: User;
  setUser: (user?: User) => void;
  logout: () => void;
}

// ⚙️ Tạo context
const UserContext = createContext<UserContextType | undefined>(undefined);

// ✅ Provider bọc quanh App
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | undefined>();
  const navigate = useNavigate();

  // 🔁 Khi load: lấy user từ localStorage nếu có
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Lỗi khi đọc user từ localStorage:', error);
      }
    }
  }, []);

  // 🚪 Hàm đăng xuất
  const logout = () => {
    localStorage.removeItem('user');
    setUser(undefined);
    navigate('/login'); // chuyển hướng về trang đăng nhập
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// 🪝 Hook để dùng trong component
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser phải được sử dụng trong <UserProvider>');
  return context;
};
