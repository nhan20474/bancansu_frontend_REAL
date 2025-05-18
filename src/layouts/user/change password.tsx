import React, { useState } from 'react';
import axios from '../../api/axiosConfig';
import './login.css';

const ChangePassword: React.FC = () => {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setError(null);
    if (!oldPass || !newPass || !confirmPass) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    if (newPass !== confirmPass) {
      setError('Mật khẩu mới không khớp.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/user/change-password', {
        oldPassword: oldPass,
        newPassword: newPass,
      });
      setMsg('Đổi mật khẩu thành công!');
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đổi mật khẩu thất bại.');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Đổi mật khẩu</h2>
        {msg && <div className="form-success">{msg}</div>}
        {error && <div className="form-error">{error}</div>}
        <div className="form-group">
          <label>Mật khẩu cũ</label>
          <input
            type="password"
            className="form-input"
            value={oldPass}
            onChange={e => setOldPass(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Mật khẩu mới</label>
          <input
            type="password"
            className="form-input"
            value={newPass}
            onChange={e => setNewPass(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Nhập lại mật khẩu mới</label>
          <input
            type="password"
            className="form-input"
            value={confirmPass}
            onChange={e => setConfirmPass(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="form-btn" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
        </button>
        <div className="form-links" style={{marginTop: 12}}>
          <a href="/login">Quay lại đăng nhập</a>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;