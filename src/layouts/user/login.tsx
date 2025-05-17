import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import axios from '../../api/axiosConfig';
import './login.css';

const Login = () => {
  const { setUser } = useUser();
  const history = useHistory();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await axios.post('/auth/login', { username, password });
      const data = res.data;
      if (!data.MaNguoiDung) {
        setError('Đăng nhập thành công nhưng thiếu userId (MaNguoiDung) từ backend.');
        return;
      }
      const user = {
        userId: data.MaNguoiDung,
        name: data.HoTen,
        email: data.Email,
        avatar: data.avatar || '/avatar-placeholder.png'
      };
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      history.push('/');
    } catch (err: any) {
      console.error('Đăng nhập lỗi:', err, err.response?.data);
      setError(
        err.response?.data?.message ||
        'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'
      );
    }
  };

  return (
    <div className="login-container">
      <form className="login-form form-standard" onSubmit={handleLogin}>
        <h2>Đăng nhập</h2>
        {error && <div className="form-error">{error}</div>}
        <div className="form-group">
          <label htmlFor="username">Tên đăng nhập</label>
          <input
            id="username"
            type="text"
            className="form-input"
            placeholder="Tên đăng nhập..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Mật khẩu</label>
          <input
            id="password"
            type="password"
            className="form-input"
            placeholder="Mật khẩu..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <button type="submit" className="form-btn">Đăng nhập</button>
      </form>
    </div>
  );
};

export default Login;
