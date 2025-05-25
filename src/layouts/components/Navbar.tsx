import React, { useEffect, useState, useRef } from 'react';
import axios from '../../api/axiosConfig';
import './Navbar.css';
import { useUser } from '../../contexts/UserContext';
import { Link } from 'react-router-dom';

interface NavbarProps {
  toggleSidebar: () => void;
  toggleFullscreen: () => void;
  notifications: Notification[]; // Thêm prop notifications
}

interface Notification {
  MaThongBao: number;
  TieuDe: string;
  ThoiGianGui: string;
  read?: boolean; // Thêm thuộc tính read
}

const Navbar = ({ toggleSidebar, toggleFullscreen, notifications: propNotifications }: NavbarProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null); // Thêm ref cho tài khoản
  const { user, logout } = useUser();

  useEffect(() => {
    axios.get('/thongbao/latest?limit=5')
      .then(res => setNotifications(res.data))
      .catch(() => setNotifications([]));
  }, []);

  useEffect(() => {
    if (propNotifications && propNotifications.some(n => !n.read)) {
      setHasNewNotification(true);
    } else {
      setHasNewNotification(false);
    }
  }, [propNotifications]);

  // Đóng dropdown thông báo khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  // Đóng dropdown tài khoản khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

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
        <div className="notification-bell" ref={bellRef} style={{ position: 'relative' }}>
          <i
            className="fas fa-bell"
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ cursor: 'pointer', fontSize: '1.3rem', color: '#1e3a8a', marginRight: 16 }}
            title="Thông báo"
          />
          {/* Hiển thị số thông báo mới */}
          {notifications.length > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -2,
                right: 6,
                minWidth: 18,
                height: 18,
                background: '#d32f2f',
                color: '#fff',
                borderRadius: '50%',
                fontSize: 12,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #fff',
                zIndex: 2,
                padding: '0 5px'
              }}
            >
              {notifications.length}
            </span>
          )}
          {showDropdown && (
            <div className="notification-dropdown">
              <div className="dropdown-title">Thông báo mới</div>
              <ul>
                {notifications.length === 0 && <li className="empty">Không có thông báo mới</li>}
                {notifications.map(tb => (
                  <li key={tb.MaThongBao}>
                    <b>{tb.TieuDe}</b>
                    <div className="time">{new Date(tb.ThoiGianGui).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
              <a href="/notifications" className="see-all">Xem tất cả</a>
            </div>
          )}
        </div>

        {!user ? (
          <Link to="/login" className="login-link">
            <i className="fas fa-sign-in-alt me-1"></i> Đăng nhập
          </Link>
        ) : (
          <div
            className="avatar-wrapper"
            ref={userRef}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ position: 'relative' }}
          >
            <i className="fas fa-user-circle avatar" style={{fontSize: '2rem', color: '#2563eb'}}></i>
            {dropdownOpen && (
              <div className="user-dropdown">
                <div className="user-info">
                  <strong>{user.name}</strong>
                  <p>{user.email}</p>
                  <p style={{fontSize: '0.85em', color: '#888'}}>
                    ID: {user.userId ?? 'Không có userId'}
                  </p>
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
