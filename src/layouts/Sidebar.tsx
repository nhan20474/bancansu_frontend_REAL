import React from 'react';
import './Sidebar.css'; // Import your CSS file for styling
type DropdownKey = 'docs' | 'forum' | 'survey' | 'other';

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
      {/* <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} dropdown-icon`}></i> */}
      <i className={`${isOpen ? 'up' : 'down'} dropdown-icon`}></i>
    </li>
    {isOpen && <ul className="submenu">{children}</ul>}
  </>
);

const Sidebar = (props: SidebarProps) => {
  const { sidebarOpen, toggleSidebar, dropdowns, toggleDropdown } = props;

  return (
    <aside className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
      <div className="sidebar-header">
        <div className="logo"><i className="fas fa-layer-group"></i> CLASS MANAGER</div>
        <button className="close-btn" onClick={toggleSidebar}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      <ul className="menu">
        <li><i className="fas fa-home"></i> <span>Trang chủ</span></li>
        <li><i className="fas fa-user"></i> <span>Hồ sơ cá nhân</span></li>

        <DropdownItem
          icon="fas fa-book"
          title="Tài liệu"
          isOpen={dropdowns.docs}
          onToggle={() => toggleDropdown('docs')}
        >
          <li><i className="fas fa-file-alt"></i> <span>Giáo trình</span></li>
          <li><i className="fas fa-download"></i> <span>Tài liệu tải về</span></li>
        </DropdownItem>

        <DropdownItem
          icon="fas fa-users"
          title="Diễn đàn"
          isOpen={dropdowns.forum}
          onToggle={() => toggleDropdown('forum')}
        >
          <li><i className="fas fa-comments"></i> <span>Thảo luận</span></li>
          <li><i className="fas fa-lightbulb"></i> <span>Ý kiến đóng góp</span></li>
        </DropdownItem>

        <DropdownItem
          icon="fas fa-clipboard-list"
          title="Khảo sát"
          isOpen={dropdowns.survey}
          onToggle={() => toggleDropdown('survey')}
        >
          <li><i className="fas fa-check"></i> <span>Khảo sát môn học</span></li>
          <li><i className="fas fa-poll"></i> <span>Ý kiến sinh viên</span></li>
        </DropdownItem>

        <li><i className="fas fa-check-circle"></i> <span>Rèn luyện</span></li>
        <DropdownItem
          icon="fas fa-ellipsis-h"
          title="Khác"
          isOpen={dropdowns.other}
          onToggle={() => toggleDropdown('other')}
        >
          <li><i className="fas fa-question-circle"></i> <span>Trợ giúp</span></li>
          <li><i className="fas fa-info-circle"></i> <span>Giới thiệu</span></li>
        </DropdownItem>

        <li><i className="fas fa-cogs"></i> <span>Tài khoản</span></li>
      </ul>
    </aside>
  );
};

export default Sidebar;
