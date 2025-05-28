import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import axios from '../../api/axiosConfig';
import './ChangePasswordForm.css';

const ChangePasswordForm: React.FC = () => {
  const { user } = useUser();
  const history = useHistory();
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Xóa lỗi khi user bắt đầu nhập
    if (error) setError(null);
  };

  const togglePasswordVisibility = (field: 'old' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    if (!formData.oldPassword.trim()) {
      setError('Vui lòng nhập mật khẩu hiện tại.');
      return false;
    }
    if (!formData.newPassword.trim()) {
      setError('Vui lòng nhập mật khẩu mới.');
      return false;
    }
    if (formData.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return false;
    }
    if (!formData.confirmPassword.trim()) {
      setError('Vui lòng xác nhận mật khẩu mới.');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu mới và xác nhận không khớp.');
      return false;
    }
    if (formData.oldPassword === formData.newPassword) {
      setError('Mật khẩu mới phải khác mật khẩu hiện tại.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const userFromStorage = JSON.parse(localStorage.getItem('user') || '{}');
      const MaNguoiDung = user?.userId || userFromStorage.userId || userFromStorage.MaNguoiDung;

      await axios.post('/auth/change-password', {
        MaNguoiDung,
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      });

      setSuccess('Đổi mật khẩu thành công!');
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setTimeout(() => {
        history.push('/profile');
      }, 2000);

    } catch (err: any) {
      if (err.response?.status === 400) {
        setError(
          err.response.data?.message ||
          'Thiếu thông tin hoặc dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường nhập.'
        );
      } else if (err.response?.status === 401) {
        setError('Mật khẩu hiện tại không đúng.');
      } else {
        setError('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra strength của password
  const getPasswordStrength = (password: string) => {
    if (password.length < 3) return 'weak';
    if (password.length < 6) return 'medium';
    return 'good';
  };

  // Redirect nếu chưa đăng nhập
  if (!user) {
    history.push('/login');
    return null;
  }

  return (
    <div className="change-password-container">
      <div className="change-password-form">
        {/* Header */}
        <div className="form-header">
          <div className="header-icon">
            <i className="fas fa-key"></i>
          </div>
          <h2>Đổi mật khẩu</h2>
          <p className="subtitle">Cập nhật mật khẩu bảo mật cho tài khoản của bạn</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="form-message error">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="form-message success">
            <i className="fas fa-check-circle"></i>
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Mật khẩu cũ */}
          <div className="form-group">
            <label htmlFor="oldPassword">
              <i className="fas fa-lock"></i>
              Mật khẩu hiện tại
            </label>
            <div className="password-wrapper">
              <input
                id="oldPassword"
                name="oldPassword"
                type={showPasswords.old ? 'text' : 'password'}
                placeholder="Nhập mật khẩu hiện tại..."
                value={formData.oldPassword}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => togglePasswordVisibility('old')}
                disabled={loading}
                title={showPasswords.old ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                <i className={`fas ${showPasswords.old ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          {/* Mật khẩu mới */}
          <div className="form-group">
            <label htmlFor="newPassword">
              <i className="fas fa-key"></i>
              Mật khẩu mới
            </label>
            <div className="password-wrapper">
              <input
                id="newPassword"
                name="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                placeholder="Nhập mật khẩu mới..."
                value={formData.newPassword}
                onChange={handleChange}
                required
                disabled={loading}
                minLength={6}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => togglePasswordVisibility('new')}
                disabled={loading}
                title={showPasswords.new ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                <i className={`fas ${showPasswords.new ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div className="password-strength">
                <div className="strength-indicator">
                  <div className={`strength-bar ${getPasswordStrength(formData.newPassword)}`}></div>
                </div>
                <div className="password-hint">
                  <i className="fas fa-info-circle"></i>
                  Mật khẩu phải có ít nhất 6 ký tự
                </div>
              </div>
            )}
          </div>

          {/* Xác nhận mật khẩu */}
          <div className="form-group">
            <label htmlFor="confirmPassword">
              <i className="fas fa-check-double"></i>
              Xác nhận mật khẩu mới
            </label>
            <div className="password-wrapper">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                placeholder="Nhập lại mật khẩu mới..."
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => togglePasswordVisibility('confirm')}
                disabled={loading}
                title={showPasswords.confirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                <i className={`fas ${showPasswords.confirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {/* Password Match Indicator */}
            {formData.confirmPassword && (
              <div className={`password-match ${formData.newPassword === formData.confirmPassword ? 'match' : 'no-match'}`}>
                <i className={`fas ${formData.newPassword === formData.confirmPassword ? 'fa-check' : 'fa-times'}`}></i>
                <span>
                  {formData.newPassword === formData.confirmPassword ? 'Mật khẩu khớp' : 'Mật khẩu không khớp'}
                </span>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button 
              type="submit" 
              className={`form-btn primary ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  Đổi mật khẩu
                </>
              )}
            </button>

            <button
              type="button"
              className="form-btn secondary"
              onClick={() => history.goBack()}
              disabled={loading}
            >
              <i className="fas fa-arrow-left"></i>
              Quay lại
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordForm;
