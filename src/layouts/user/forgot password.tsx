import React, { useState } from 'react';
import axios from '../../api/axiosConfig';
import './login.css';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setError(null);
    setLoading(true);
    try {
      await axios.post('/auth/forgot-password', { email });
      setMsg('Vui lòng kiểm tra email để nhận hướng dẫn đặt lại mật khẩu.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể gửi yêu cầu. Vui lòng thử lại.');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Quên mật khẩu</h2>
        {msg && <div className="form-success">{msg}</div>}
        {error && <div className="form-error">{error}</div>}
        <div className="form-group">
          <label htmlFor="email">Email đăng ký</label>
          <input
            id="email"
            type="email"
            className="form-input"
            placeholder="Nhập email của bạn..."
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <button type="submit" className="form-btn" disabled={loading}>
          {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
        </button>
        <div className="form-links" style={{ marginTop: 12 }}>
          <a href="/login">Quay lại đăng nhập</a>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;