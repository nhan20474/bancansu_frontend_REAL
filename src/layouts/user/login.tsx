import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import axios from '../../api/axiosConfig';
import './login.css';

const Login = () => {
  const { setUser } = useUser();
  const history = useHistory();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Hàm lấy role từ response backend
  function getUserRole(data: any): string {
    return (
      data.VaiTro ||
      data.role ||
      data.vaitro ||
      data.Role ||
      data.ROLE ||
      ''
    ).toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await axios.post('/auth/login', {
        username: username.trim(),
        password: password
      });

      const data = res.data;
      const token = data.token;
      const userId = data.userId || data.MaNguoiDung;
      const name = data.name || data.HoTen || data.username || '';
      const email = data.email || data.Email || '';
      const role = getUserRole(data);

      // Kiểm tra backend trả về lỗi đăng nhập sai
      if (res.status === 401 || res.status === 403) {
        setError('Sai tên đăng nhập hoặc mật khẩu.');
        setLoading(false);
        return;
      }

      // Nếu không nhận được token từ backend (token == null/undefined/''), đây là lỗi backend.
      if (!token) {
        setError('Đăng nhập thất bại: Không nhận được token từ máy chủ. (Lỗi backend, vui lòng kiểm tra API trả về)');
        setLoading(false);
        return;
      }
      // Nếu không có role hoặc role rỗng, báo lỗi thiếu quyền
      if (!role) {
        setError('Đăng nhập thất bại: Thiếu thông tin quyền (role). Vui lòng liên hệ quản trị viên hoặc kiểm tra lại API.');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      const user = {
        userId,
        name,
        email,
        role,
        avatar: data.avatar || data.HinhAnh || '/avatar-placeholder.png'
      };

      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      history.push('/');
    } catch (err: any) {
      // Nếu backend trả về lỗi 401 hoặc 403 thì báo sai tài khoản/mật khẩu
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Sai tên đăng nhập hoặc mật khẩu. Vui lòng kiểm tra lại thông tin đăng nhập.');
      } else if (err.response?.status === 400) {
        setError('Vui lòng nhập đầy đủ thông tin.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Không thể kết nối tới máy chủ. Vui lòng kiểm tra lại kết nối mạng.');
      } else {
        setError(
          err.response?.data?.message ||
          (typeof err.response?.data === 'string' ? err.response.data : '') ||
          'Không thể đăng nhập. Vui lòng thử lại.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        {/* Enhanced Header */}
        <div className="form-header">
          <div className="header-icon">
            <i className="fas fa-sign-in-alt"></i>
          </div>
          <h2>Đăng nhập</h2>
          <p className="subtitle">Chào mừng bạn quay trở lại</p>
        </div>
        
        {/* Enhanced Error Message */}
        {error && (
          <div className="form-message error">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}

        {/* Enhanced Username Input */}
        <div className="form-group">
          <label htmlFor="username">
            <i className="fas fa-user"></i>
            Tên đăng nhập
          </label>
          <input
            id="username"
            type="text"
            className="form-input"
            placeholder="Nhập tên đăng nhập..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            disabled={loading}
          />
        </div>

        {/* Enhanced Password Input */}
        <div className="form-group password-group">
          <label htmlFor="password">
            <i className="fas fa-lock"></i>
            Mật khẩu
          </label>
          <div className="password-wrapper">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="Nhập mật khẩu..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
        </div>

        {/* Enhanced Links */}
        <div className="form-links">
          <Link to="/forgot-password" className="forgot-link">
            <i className="fas fa-question-circle"></i>
            Quên mật khẩu?
          </Link>
        </div>

        {/* Enhanced Submit Button */}
        <button 
          type="submit" 
          className={`form-btn primary ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="loading-spinner"></div>
              Đang đăng nhập...
            </>
          ) : (
            <>
              <i className="fas fa-sign-in-alt"></i>
              Đăng nhập
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default Login;
