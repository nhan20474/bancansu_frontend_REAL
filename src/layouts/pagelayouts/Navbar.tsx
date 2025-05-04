import React, { useState } from 'react';
import './Navbar.css';
import { useUser } from '../../contexts/UserContext';
import { Link } from 'react-router-dom';

interface NavbarProps {
  toggleSidebar: () => void;
  toggleFullscreen: () => void;
}

const Navbar = ({ toggleSidebar, toggleFullscreen }: NavbarProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useUser();

  return (
    <nav className="top-navbar d-flex justify-between align-center px-3">
      <div className="d-flex align-center">
        <button className="toggle-btn" onClick={toggleSidebar}>
          <i className="fas fa-bars"></i>
        </button>
        <span className="navbar-title">CLASS MANAGER</span>
      </div>

      <div className="navbar-actions d-flex align-center gap-4">
        <i className="fas fa-expand-arrows-alt icon-btn" onClick={toggleFullscreen}></i>
        <i className="fas fa-cog icon-btn"></i>
        <i className="fas fa-bell icon-btn"></i>

        {!user ? (
          <Link to="/login" className="login-link">
            <i className="fas fa-sign-in-alt me-1"></i> Đăng nhập
          </Link>
        ) : (
          <div className="avatar-wrapper" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <img
              src={user.avatar || '/avatar-placeholder.png'}
              alt="User Avatar"
              className="avatar"
            />
            {dropdownOpen && (
              <div className="user-dropdown">
                <div className="user-info">
                  <strong>{user.name}</strong>
                  <p>{user.email}</p>
                </div>
                <ul>
                  <li className="disabled">Tài khoản</li>
                  <li>Ngôn ngữ</li>
                  <li>Cài đặt hiển thị</li>
                  <li>Toàn màn hình <span className="shortcut">F11</span></li>
                  <li>Khôi phục giao diện mặc định</li>
                  <hr />
                  <li className="logout" onClick={logout}>Đăng xuất</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
