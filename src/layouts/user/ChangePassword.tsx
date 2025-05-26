import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import axios from '../../api/axiosConfig';
import './login.css';

const ChangePassword: React.FC = () => {
  const { user } = useUser();
  const history = useHistory();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    if (formData.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return false;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return false;
    }
    
    if (formData.currentPassword === formData.newPassword) {
      setError('Mật khẩu mới phải khác mật khẩu hiện tại.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      await axios.post('/auth/change-password', {
        userId: user?.userId,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      setMessage('Đổi mật khẩu thành công! Bạn sẽ được chuyển hướng...');
      
      setTimeout(() => {
        history.push('/');
      }, 2000);
      
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Mật khẩu hiện tại không đúng.');
      } else if (err.response?.status === 400) {
        setError('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.');
      } else {
        setError(
          err.response?.data?.message ||
          'Có lỗi xảy ra. Vui lòng thử lại sau.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    history.push('/login');
    return null;
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Đổi mật khẩu</h2>
        <p className="subtitle">Cập nhật mật khẩu cho tài khoản của bạn</p>
        
        {error && <div className="form-error">{error}</div>}
        {message && <div className="form-success">{message}</div>}

        <div className="form-group password-group">
          <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
          <div className="password-wrapper">
            <input
              id="currentPassword"
              name="currentPassword"
              type={showPasswords.current ? 'text' : 'password'}
              className="form-input"
              placeholder="Nhập mật khẩu hiện tại..."
              value={formData.currentPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => togglePasswordVisibility('current')}
              disabled={loading}
            >
              {showPasswords.current ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <div className="form-group password-group">
          <label htmlFor="newPassword">Mật khẩu mới</label>
          <div className="password-wrapper">
            <input
              id="newPassword"
              name="newPassword"
              type={showPasswords.new ? 'text' : 'password'}
              className="form-input"
              placeholder="Nhập mật khẩu mới..."
              value={formData.newPassword}
              onChange={handleChange}
              required
              disabled={loading}
              minLength={6}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => togglePasswordVisibility('new')}
              disabled={loading}
            >
              {showPasswords.new ? '🙈' : '👁️'}
            </button>
          </div>
          <div className="password-hint">
            Mật khẩu phải có ít nhất 6 ký tự
          </div>
        </div>

        <div className="form-group password-group">
          <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
          <div className="password-wrapper">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPasswords.confirm ? 'text' : 'password'}
              className="form-input"
              placeholder="Nhập lại mật khẩu mới..."
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => togglePasswordVisibility('confirm')}
              disabled={loading}
            >
              {showPasswords.confirm ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          className={`form-btn ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
        </button>

        <div className="form-links" style={{ marginTop: '1.5rem' }}>
          <button
            type="button"
            onClick={() => history.goBack()}
            className="back-link"
          >
            ← Quay lại
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
