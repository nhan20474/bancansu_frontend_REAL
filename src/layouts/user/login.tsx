import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import axios from '../../api/axiosConfig';
import './login.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Nếu bạn bị lỗi icon, có thể thay bằng emoji 👁️/🙈

const Login = () => {
  const { setUser } = useUser();
  const history = useHistory();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await axios.post('/auth/login', { username, password });
      const data = res.data;
      if (!data.MaNguoiDung) {
        setError('Thiếu thông tin người dùng.');
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
      console.error('Đăng nhập lỗi:', err);
      setError(err.response?.data?.message || 'Sai tên đăng nhập hoặc mật khẩu.');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
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

        <div className="form-group password-group">
          <label htmlFor="password">Mật khẩu</label>
          <div className="password-wrapper">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="Mật khẩu..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
              {/* Nếu lỗi icon: thay bằng {showPassword ? '🙈' : '👁️'} */}
            </button>
          </div>
        </div>

        <div className="form-links" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <a href="/forgot-password">Quên mật khẩu?</a>
        </div>

        <button type="submit" className="form-btn">Đăng nhập</button>
      </form>
    
    </div>
  );
};

export default Login;
