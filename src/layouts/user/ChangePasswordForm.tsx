import React, { useState } from 'react';
import axios from '../../api/axiosConfig';
import { useUser } from '../../contexts/UserContext';
import './ChangePasswordForm.css'; // Thêm file css riêng cho form đổi mật khẩu

const ChangePasswordForm: React.FC = () => {
  const { user } = useUser();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!user?.userId) {
      setError('Bạn cần đăng nhập để đổi mật khẩu.');
      return;
    }

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và xác nhận không khớp.');
      return;
    }
    if (oldPassword === newPassword) {
      setError('Mật khẩu mới không được trùng mật khẩu cũ.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('http://localhost:8080/api/change-password', {
        userId: user?.userId,
        oldPassword,
        newPassword,
      });
      setMessage('Đổi mật khẩu thành công!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Đổi mật khẩu thất bại.'
      );
    }
    setLoading(false);
  };

  return (
    <form className="change-password-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Mật khẩu cũ:</label>
        <input
          type="password"
          value={oldPassword}
          onChange={e => setOldPassword(e.target.value)}
          placeholder="Nhập mật khẩu cũ"
          autoComplete="current-password"
        />
      </div>
      <div className="form-group">
        <label>Mật khẩu mới:</label>
        <input
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          placeholder="Nhập mật khẩu mới"
          autoComplete="new-password"
        />
      </div>
      <div className="form-group">
        <label>Nhập lại mật khẩu mới:</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="Nhập lại mật khẩu mới"
          autoComplete="new-password"
        />
      </div>
      <button type="submit" className="form-btn" disabled={loading}>
        {loading ? 'Đang đổi...' : 'Đổi mật khẩu'}
      </button>
      {message && <div className="form-success">{message}</div>}
      {error && <div className="form-error">{error}</div>}
    </form>
  );
};

export default ChangePasswordForm;
