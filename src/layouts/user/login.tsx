import React, { useState } from 'react';
import './login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Gửi dữ liệu đăng nhập
    console.log({ email, password });
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2 className="login-title">
          <i className="fas fa-sign-in-alt me-2"></i>Đăng nhập hệ thống
        </h2>

        <div className="form-group">
          <label htmlFor="email"><i className="fas fa-envelope"></i> Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Nhập email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password"><i className="fas fa-lock"></i> Mật khẩu</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Nhập mật khẩu"
          />
        </div>

        <button type="submit" className="btn-login">
          <i className="fas fa-sign-in-alt"></i> Đăng nhập
        </button>
      </form>
    </div>
  );
};

export default Login;
