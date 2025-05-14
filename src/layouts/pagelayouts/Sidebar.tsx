import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

type DropdownKey = 'docs' | 'forum' | 'survey' | 'other' | 'hutech';

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
          <Link to="/profilepage" className="menu-link">
            <i className="fas fa-user"></i> <span>Hồ sơ cá nhân</span>
          </Link>
        </li>

        <DropdownItem
          icon="fas fa-book"
          title="Tài liệu"
          isOpen={dropdowns.docs}
          onToggle={() => toggleDropdown('docs')}
        >
          <li>
            <Link to="/textbooks" className="submenu-link">
              <i className="fas fa-file-alt"></i> <span>Giáo trình</span>
            </Link>
          </li>
          <li>
            <Link to="/downloads" className="submenu-link">
              <i className="fas fa-download"></i> <span>Tài liệu tải về</span>
            </Link>
          </li>
        </DropdownItem>

        <DropdownItem
          icon="fas fa-users"
          title="Diễn đàn"
          isOpen={dropdowns.forum}
          onToggle={() => toggleDropdown('forum')}
        >
          <li>
            <Link to="/forum/discussion" className="submenu-link">
              <i className="fas fa-comments"></i> <span>Thảo luận</span>
            </Link>
          </li>
          <li>
            <Link to="/forum/feedback" className="submenu-link">
              <i className="fas fa-lightbulb"></i> <span>Ý kiến đóng góp</span>
            </Link>
          </li>
        </DropdownItem>

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
          icon="fas fa-clipboard-list"
          title="Khảo sát"
          isOpen={dropdowns.survey}
          onToggle={() => toggleDropdown('survey')}
        >
          <li>
            <Link to="/survey/course" className="submenu-link">
              <i className="fas fa-check"></i> <span>Khảo sát môn học</span>
            </Link>
          </li>
          <li>
            <Link to="/survey/feedback" className="submenu-link">
              <i className="fas fa-poll"></i> <span>Ý kiến sinh viên</span>
            </Link>
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
          <Link to="/account" className="menu-link">
            <i className="fas fa-cogs"></i> <span>Tài khoản</span>
          </Link>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
