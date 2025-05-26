import React, { useState } from 'react';
import axios from '../../api/axiosConfig';
import './ChangePasswordForm.css'; // Thêm file css riêng cho form đổi mật khẩu

const ChangePasswordForm: React.FC = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Kiểm tra dữ liệu đầu vào
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và xác nhận không khớp.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    try {
      // Nếu backend yêu cầu MaNguoiDung, hãy lấy từ user context hoặc localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const MaNguoiDung = user.userId || user.MaNguoiDung;

      await axios.post(
        'http://localhost:8080/api/change-password', // Gửi đúng endpoint tuyệt đối
        {
          MaNguoiDung, // Thêm MaNguoiDung vào payload nếu backend yêu cầu
          oldPassword,
          newPassword
        }
        // , { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Đổi mật khẩu thành công!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      // Bổ sung thông báo lỗi chi tiết nếu thiếu trường hoặc backend trả về lỗi thiếu thông tin
      if (err.response?.status === 400) {
        setError(
          err.response.data?.message ||
          'Thiếu thông tin hoặc dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường nhập.'
        );
      } else if (err.response?.status === 401) {
        setError('Bạn cần đăng nhập lại.');
      } else {
        setError('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    }
  };

  return (
    <form className="change-password-form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}
      {success && <div className="form-success">{success}</div>}
      <div className="form-group">
        <label>Mật khẩu cũ</label>
        <input
          type="password"
          value={oldPassword}
          onChange={e => setOldPassword(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>Mật khẩu mới</label>
        <input
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>Xác nhận mật khẩu mới</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="form-btn">Đổi mật khẩu</button>
    </form>
  );
};

export default ChangePasswordForm;
