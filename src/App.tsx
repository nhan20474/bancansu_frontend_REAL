import React from 'react';
import './App.css';

function App() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo"> CLASS MANAGER </div>
        <ul className="menu">
          <li><i className="fas fa-home"></i> Trang chủ</li>
          <li><i className="fas fa-user"></i> Hồ sơ cá nhân</li>
          <li><i className="fas fa-book"></i> Tài liệu</li>
          <li><i className="fas fa-users"></i> Diễn đàn</li>
          <li><i className="fas fa-clipboard-list"></i> Khảo sát</li>
          <li><i className="fas fa-check-circle"></i> Rèn luyện</li>
          <li><i className="fas fa-question-circle"></i> Trợ giúp</li>
          <li><i className="fas fa-solid fa-ellipsis"></i> Khác</li>
          <li><i className="fas fa-cogs"></i> Tài khoản</li>
        </ul>
      </aside>

      <main className="main">
        <header className="main-header">
          <h2>WELCOME</h2>
          <p>Chào mừng đến với cổng sinh viên HUTECH</p>
        </header>
      </main>
    </div>
  );
}

export default App;
