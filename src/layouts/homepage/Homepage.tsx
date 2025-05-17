// File: HomePage.tsx
import React from 'react';
import './Homepage.css';

const HomePage = () => {
  const handleReminderClick = () => {
    // Add your handler logic here
    console.log('Reminder clicked');
  };

  const handleScheduleClick = () => {
    // Add your handler logic here
    console.log('Schedule clicked');
  };

  return (
    <div className="homepage-container">
      <h2 className="welcome-text">Chào mừng đến với cổng sinh viên HUTECH</h2>

      <div className="grid-layout">
        {/* Thông tin sinh viên */}
        <div className="card user-info">
          <div className="avatar">LN</div>
          <h3>Lê Thanh Nam</h3>
          <p>Mã số sinh viên: 01234567</p>
          <p>Ngày sinh: 02/02/2003</p>
          <p>Email: lethanhnamhaen@email.com</p>
          <p>Điện thoại: 0123456789</p>
          <p>Khóa: CNTTT</p>
          <p>Khoa: Công nghệ thông tin</p>
        </div>

        {/* Nhắc nhở */}
        <div className="card reminder">
          <h4>Nhắc nhở mới, chưa xem</h4>
          <p className="count">17</p>
          <button type="button" onClick={handleReminderClick}>
            Xem chi tiết
          </button>
        </div>

        {/* Lịch học */}
        <div className="card schedule">
          <h4>Lịch học trong tuần</h4>
          <p className="count">0</p>
          <button type="button" onClick={handleScheduleClick}>
            Xem chi tiết
          </button>
        </div>

        {/* Thông báo chung */}
        <div className="card notify">
          <h4>Thông báo chung</h4>
          <ul>
            <li>Nội dung thông báo...</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
