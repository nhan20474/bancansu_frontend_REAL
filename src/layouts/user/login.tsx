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
      // Đảm bảo gửi đúng endpoint và đúng dữ liệu
      const res = await axios.post('/auth/login', {
        username: username.trim(),
        password: password
      });
      const data = res.data;
      const userId = data.userId || data.MaNguoiDung;
      const name = data.name || data.HoTen || data.username || '';
      const email = data.email || data.Email || '';
      if (!userId) {
        setError('Sai tên đăng nhập hoặc mật khẩu.');
        return;
      }
      const user = {
        userId,
        name,
        email,
        avatar: data.avatar || data.HinhAnh || '/avatar-placeholder.png'
      };
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      history.push('/');
    } catch (err: any) {
      // Xử lý lỗi 401 rõ ràng hơn
      if (err.response?.status === 401) {
        setError('Sai tên đăng nhập hoặc mật khẩu. Vui lòng kiểm tra lại thông tin đăng nhập.');
      } else if (err.response?.status === 400) {
        setError('Vui lòng nhập đầy đủ thông tin.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Không thể kết nối tới máy chủ. Vui lòng kiểm tra lại kết nối mạng hoặc liên hệ quản trị.');
      } else {
        setError(
          err.response?.data?.message ||
          (typeof err.response?.data === 'string' ? err.response.data : '') ||
          'Không thể đăng nhập. Vui lòng thử lại.'
        );
      }
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
              {showPassword ? '🙈' : '👁️'}
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
