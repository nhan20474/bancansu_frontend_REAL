import React, { createContext, useContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

// 🎯 Kiểu dữ liệu người dùng
export interface User {
  userId: number; // thêm userId
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
  const history = useHistory();

  // 🔁 Khi load: lấy user từ localStorage nếu có
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser.avatar) {
          parsedUser.avatar = '/avatar-placeholder.png'; // avatar mặc định
        }
        setUser(parsedUser);
      } catch (error) {
        console.error('Lỗi khi đọc user từ localStorage:', error);
      }
    }
  }, []);

  // 🚪 Hàm đăng xuất
  const logout = () => {
    localStorage.removeItem('user');
    setUser(undefined);
    history.push('/login'); // chuyển hướng về trang đăng nhập
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
