import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

type DropdownKey = 'other' | 'hutech';

interface SidebarProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  dropdowns: Record<DropdownKey, boolean>;
  toggleDropdown: (key: DropdownKey) => void;
}

interface DropdownItemProps {
  icon: string;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const DropdownItem = ({ icon, title, isOpen, onToggle, children }: DropdownItemProps) => (
  <>
    <li onClick={onToggle} className="dropdown-toggle">
      <i className={icon}></i> <span>{title}</span>
      <i className={`${isOpen ? 'up' : 'down'} dropdown-icon`}></i>
    </li>
    {isOpen && <ul className="submenu">{children}</ul>}
  </>
);

const Sidebar = ({ sidebarOpen, toggleSidebar, dropdowns, toggleDropdown }: SidebarProps) => {
  return (
    <aside className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
      <div className="sidebar-header">
        <div className="logo"><i className="fas fa-layer-group"></i> CLASS MANAGER</div>
        <button className="close-btn" onClick={toggleSidebar}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      <ul className="menu">
        <li>
          <Link to="/" className="menu-link">
            <i className="fas fa-home"></i> <span>Trang chủ</span>
          </Link>
        </li>

        <li>
          <Link to="/classes" className="menu-link">
            <i className="fas fa-chalkboard"></i> <span>Danh sách lớp học</span>
          </Link>
        </li>

        <li>
          <Link to="/cansu" className="menu-link">
            <i className="fas fa-users"></i> <span>Danh sách cán sự</span>
          </Link>
        </li>

        <li>
          <Link to="/tasks" className="menu-link">
            <i className="fas fa-tasks"></i> <span>Nhiệm vụ</span>
          </Link>
        </li>

        <li>
          <Link to="/feedback" className="menu-link">
            <i className="fas fa-comment-dots"></i> <span>Đánh giá & góp ý</span>
          </Link>
        </li>

        <li>
          <Link to="/reports" className="menu-link">
            <i className="fas fa-chart-bar"></i> <span>Thống kê & báo cáo</span>
          </Link>
        </li>

        <DropdownItem
          icon="fas fa-university"
          title="Hệ thống HUTECH"
          isOpen={dropdowns.hutech}
          onToggle={() => toggleDropdown('hutech')}
        >
          <li onClick={() => window.open('https://daotao.hutech.edu.vn', '_blank')}>
            <i className="fas fa-check-circle"></i> <span>Web Đào tạo</span>
          </li>
          <li onClick={() => window.open('https://hocvudientu.hutech.edu.vn/', '_blank')}>
            <i className="fas fa-poll"></i> <span>Web Học vụ</span>
          </li>
          <li onClick={() => window.open('https://sinhvien2.hutech.edu.vn/', '_blank')}>
            <i className="fas fa-user-graduate"></i> <span>Web Sinh viên</span>
          </li>
        </DropdownItem>

        <DropdownItem
          icon="fas fa-ellipsis-h"
          title="Khác"
          isOpen={dropdowns.other}
          onToggle={() => toggleDropdown('other')}
        >
          <li>
            <Link to="/help" className="submenu-link">
              <i className="fas fa-question-circle"></i> <span>Trợ giúp</span>
            </Link>
          </li>
          <li>
            <Link to="/about" className="submenu-link">
              <i className="fas fa-info-circle"></i> <span>Giới thiệu</span>
            </Link>
          </li>
        </DropdownItem>

        <li>
          <Link to="/profilepage" className="menu-link">
            <i className="fas fa-user"></i> <span>Tài khoản</span>
          </Link>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
