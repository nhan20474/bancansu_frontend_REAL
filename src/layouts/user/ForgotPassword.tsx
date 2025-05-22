import React, { useState } from 'react';
import axios from '../../api/axiosConfig';
import './ForgotPassword.css';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [maSoSV, setMaSoSV] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await axios.post('/forgot-password', { email, MaSoSV: maSoSV });
      setMessage(res.data.message || 'Đã gửi mật khẩu mới qua email!');
    } catch (err: any) {
      setMessage(
        err.response?.data?.message ||
        'Có lỗi xảy ra, vui lòng thử lại.'
      );
    }
    setLoading(false);
  };

  return (
    <div className="forgot-password-page">
      <h2>Quên mật khẩu</h2>
      <form className="forgot-password-form" onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Nhập email"
          />
        </div>
        <div>
          <label>Hoặc mã số sinh viên:</label>
          <input
            type="text"
            value={maSoSV}
            onChange={e => setMaSoSV(e.target.value)}
            placeholder="Nhập mã số sinh viên"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
        </button>
      </form>
      {message && <div style={{ marginTop: 12, color: 'red' }}>{message}</div>}
    </div>
  );
};

export default ForgotPassword;
