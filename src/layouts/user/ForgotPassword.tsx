import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axiosConfig';
import './login.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'sent'>('input');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      await axios.post('/auth/forgot-password', {
        email: email.trim(),
        username: username.trim()
      });
      
      setMessage('Đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn.');
      setStep('sent');
      
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Không tìm thấy tài khoản với thông tin đã cung cấp.');
      } else if (err.response?.status === 400) {
        setError('Vui lòng nhập đầy đủ thông tin.');
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

  const handleResend = () => {
    setStep('input');
    setMessage(null);
    setError(null);
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Quên mật khẩu</h2>
        <p className="subtitle">
          {step === 'input' 
            ? 'Nhập thông tin để khôi phục mật khẩu'
            : 'Kiểm tra email của bạn'
          }
        </p>
        
        {error && <div className="form-error">{error}</div>}
        {message && <div className="form-success">{message}</div>}

        {step === 'input' ? (
          <>
            <div className="form-group">
              <label htmlFor="username">Tên đăng nhập</label>
              <input
                id="username"
                type="text"
                className="form-input"
                placeholder="Nhập tên đăng nhập..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="Nhập địa chỉ email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className={`form-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ 
              fontSize: '3rem', 
              marginBottom: '1rem',
              color: '#16a34a'
            }}>
              ✉️
            </div>
            <p style={{ 
              color: '#374151', 
              marginBottom: '1.5rem',
              lineHeight: 1.5
            }}>
              Nếu không nhận được email, vui lòng kiểm tra thư mục spam 
              hoặc thử gửi lại yêu cầu.
            </p>
            <button 
              type="button"
              className="form-btn"
              onClick={handleResend}
            >
              Gửi lại
            </button>
          </div>
        )}

        <div className="form-links" style={{ 
          marginTop: '1.5rem',
          justifyContent: 'center'
        }}>
          <Link to="/login" className="back-link">
            ← Quay lại đăng nhập
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
