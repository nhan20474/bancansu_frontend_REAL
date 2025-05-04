import React, { useState } from 'react';
import './Navbar.css'; // Import your CSS file for styling

interface NavbarProps {
  toggleSidebar: () => void;
  toggleFullscreen: () => void;
}


const Navbar = ({ toggleSidebar, toggleFullscreen }: NavbarProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="top-navbar d-flex justify-between align-center px-3">
      {/* Bên trái: nút mở sidebar + tiêu đề */}
      <div className="d-flex align-center">
        <button className="toggle-btn" onClick={toggleSidebar}>
          <i className="fas fa-bars"></i>
        </button>
        <span className="navbar-title">CLASS MANAGER</span>
      </div>

      {/* Bên phải: các icon chức năng + avatar dropdown */}
      <div className="navbar-actions d-flex align-center gap-4">
        <i className="fas fa-expand-arrows-alt icon-btn" onClick={toggleFullscreen}></i>
        <i className="fas fa-cog icon-btn"></i>
        <i className="fas fa-bell icon-btn"></i>

        <div className="avatar-wrapper" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <img src="/avatar-placeholder.png" alt="User" className="avatar" />
          {dropdownOpen && (
            <div className="user-dropdown">
              <div className="user-info">
                <strong>Lê Thành Nhân</strong>
                <p>lethanhnhanminer@gm...</p>
              </div>
              <ul>
                <li className="disabled">Tài khoản</li>
                <li>Ngôn ngữ</li>
                <li>Cài đặt hiển thị</li>
                <li>Toàn màn hình <span className="shortcut">F11</span></li>
                <li>Khôi phục giao diện mặc định</li>
                <hr />
                <li className="logout">Đăng xuất</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
