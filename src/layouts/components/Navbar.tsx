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

  // Hàm lấy URL ảnh đại diện cho navbar
  const getNavbarAvatarUrl = (user: any): string => {
    if (!user) return '/icons8-user-default-100.png';
    
    if (user.normalized && typeof user.normalized === 'string' && user.normalized.trim() !== '') {
      return user.normalized;
    }
    if (user.avatar && user.avatar.startsWith('http')) {
      return user.avatar;
    }
    if (user.HinhAnh && user.HinhAnh.trim() !== '') {
      const file = user.HinhAnh.replace(/^(App[\\/])?(uploads[\\/])?/i, '').replace(/^[/\\]+/, '');
      return `http://localhost:8080/uploads/${file}`;
    }
    if (user.avatar && user.avatar.trim() !== '') {
      const file = user.avatar.replace(/^(App[\\/])?(uploads[\\/])?/i, '').replace(/^[/\\]+/, '');
      return `http://localhost:8080/uploads/${file}`;
    }
    return '/icons8-user-default-100.png';
  };

  // Cập nhật avatar khi user thay đổi (ví dụ: đổi avatar ở trang profile)
  useEffect(() => {
    setNotifications(propNotifications || []);
  }, [propNotifications]);

  // Theo dõi user.avatar thay đổi để cập nhật lại avatar trên navbar
  useEffect(() => {
    // Khi user đổi avatar ở profile, cập nhật lại avatar ở navbar
    // (user context sẽ tự động cập nhật, chỉ cần re-render)
  }, [user?.avatar]);

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

  // Lắng nghe sự kiện reload từ avatar update
  useEffect(() => {
    const handleAvatarUpdate = () => {
      // Reload trang để đồng bộ avatar mới
      setTimeout(() => {
        window.location.reload();
      }, 500);
    };

    window.addEventListener('avatarUpdated', handleAvatarUpdate);
    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate);
    };
  }, []);

  // Chỉ hiển thị số lượng thông báo mới thực sự đang hiển thị trong dropdown
  // newNotifications là các thông báo chưa đọc (read !== true)
  const newNotifications = notifications.filter(n => !n.read);

  // Số badge trên chuông phải đúng bằng số thông báo mới thực sự hiển thị trong dropdown
  // Nếu bạn lấy notifications từ propNotifications và setNotifications từ nhiều nguồn, hãy chỉ dùng 1 nguồn nhất quán!
  // Đảm bảo notifications luôn là mảng thông báo mới nhất, không bị lặp hoặc cộng dồn.

  // Đồng bộ giao diện dropdown thông báo với trang /notifications
  // Hiển thị danh sách thông báo mới nhất (không chỉ chưa đọc), giống NotificationList
  // Sắp xếp thông báo mới nhất lên đầu
  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.ThoiGianGui).getTime() - new Date(a.ThoiGianGui).getTime()
  );

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
          {/* Hiển thị dấu chấm đỏ nếu có thông báo, không hiện số */}
          {sortedNotifications.length > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 2,
                right: 8,
                width: 12,
                height: 12,
                background: '#d32f2f',
                borderRadius: '50%',
                border: '2px solid #fff',
                zIndex: 2,
                display: 'inline-block',
                padding: 0
              }}
            ></span>
          )}
          {showDropdown && (
            <div className="notification-dropdown" style={{
              maxHeight: 260,
              overflowY: 'auto',
              minWidth: 320,
              boxShadow: '0 4px 24px #2563eb22',
              borderRadius: 10,
              background: '#fff',
              position: 'absolute',
              top: 38,
              right: 0,
              zIndex: 100,
              padding: '10px 0 0 0',
              border: '1.5px solid #e0e7ef'
            }}>
              <div className="dropdown-title" style={{
                fontWeight: 700,
                color: '#2563eb',
                fontSize: 16,
                padding: '8px 18px 8px 18px',
                borderBottom: '1px solid #e0e7ef',
                background: '#f5f8ff'
              }}>
                Thông báo mới
              </div>
              <ul style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                maxHeight: 180,
                overflowY: 'auto'
              }}>
                {sortedNotifications.length === 0 && <li className="empty" style={{
                  color: '#888',
                  textAlign: 'center',
                  padding: '18px 0'
                }}>Không có thông báo mới</li>}
                {sortedNotifications.map(tb => (
                  <li key={tb.MaThongBao} style={{
                    borderBottom: '1px solid #f1f5f9',
                    padding: '10px 18px'
                  }}>
                    <b style={{ fontSize: 15, color: '#222' }}>{tb.TieuDe}</b>
                    <div className="time" style={{
                      color: '#64748b',
                      fontSize: 13,
                      marginTop: 2
                    }}>{tb.ThoiGianGui ? new Date(tb.ThoiGianGui).toLocaleString('vi-VN') : ''}</div>
                  </li>
                ))}
              </ul>
              <a href="/notifications" className="see-all" style={{
                display: 'block',
                textAlign: 'center',
                color: '#2563eb',
                fontWeight: 600,
                padding: '10px 0 12px 0',
                textDecoration: 'none',
                borderTop: '1px solid #e0e7ef',
                background: '#f8fafc',
                borderRadius: '0 0 10px 10px'
              }}>Xem tất cả</a>
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
            <img
              src={getNavbarAvatarUrl(user)}
              alt="User Avatar"
              className="navbar-avatar"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover',
                cursor: 'pointer',
                border: '2px solid #e5e7eb'
              }}
              onError={e => {
                if ((e.target as HTMLImageElement).src.indexOf('/icons8-user-default-100.png') === -1) {
                  (e.target as HTMLImageElement).src = '/icons8-user-default-100.png';
                }
              }}
            />
            {dropdownOpen && (
              <div className="user-dropdown">
                <div className="user-info">
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <img
                      src={getNavbarAvatarUrl(user)}
                      alt="User Avatar"
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        marginRight: '12px'
                      }}
                      onError={e => {
                        if ((e.target as HTMLImageElement).src.indexOf('/icons8-user-default-100.png') === -1) {
                          (e.target as HTMLImageElement).src = '/icons8-user-default-100.png';
                        }
                      }}
                    />
                    <div>
                      <strong>{user.name}</strong>
                      <p style={{ margin: 0, fontSize: '0.9em', color: '#666' }}>{user.email}</p>
                    </div>
                  </div>
                  <p style={{fontSize: '0.85em', color: '#888', margin: 0}}>
                    ID: {user.userId ?? 'Không có userId'}
                  </p>
                </div>
                <ul>
                  <li className="disabled">Tài khoản</li>
                  <li>
                    <Link to="/profilepage" style={{ textDecoration: 'none', color: 'inherit' }}>
                      <i className="fas fa-user" style={{ marginRight: '8px' }}></i>
                      Hồ sơ cá nhân
                    </Link>
                  </li>
                  <li>
                    <Link to="/tasks" style={{ textDecoration: 'none', color: 'inherit' }}>
                      <i className="fas fa-tasks" style={{ marginRight: '8px' }}></i>
                      Nhiệm vụ
                    </Link>
                  </li>
                  <li>
                    <Link to="/change-password" style={{ textDecoration: 'none', color: 'inherit' }}>
                      <i className="fas fa-key" style={{ marginRight: '8px' }}></i>
                      Đổi mật khẩu
                    </Link>
                  </li>
                  <hr />
                  <li className="logout" onClick={logout}>
                    <i className="fas fa-sign-out-alt" style={{ marginRight: '8px' }}></i>
                    Đăng xuất
                  </li>
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
