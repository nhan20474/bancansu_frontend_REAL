// src/pages/About.tsx
import React from 'react';
import './About.css';

const About: React.FC = () => {
  return (
    <div className="about-container">
      <h1>Giới thiệu về hệ thống</h1>

      <section className="about-section">
        <h2>🎯 Mục tiêu</h2>
        <p>
          CLASS MANAGER là hệ thống hỗ trợ quản lý lớp học hiện đại cho sinh viên, ban cán sự và giảng viên tại HUTECH.
          Hệ thống giúp đơn giản hóa việc tổ chức tài liệu, quản lý nhóm, theo dõi nhiệm vụ, và giao tiếp nội bộ.
        </p>
      </section>

      <section className="about-section">
        <h2>👨‍💻 Nhóm phát triển</h2>
        <ul>
          <li>Lê Thành Nhân – Frontend Developer</li>
          <li>Lê Hoàng Danh – UI/UX Designer</li>
          <li>Nguyễn Thành Nhân – Backend Developer</li>
        </ul>
      </section>

      <section className="about-section">
        <h2>📫 Liên hệ</h2>
        <p>📧 Email: support@classmanager.edu.vn</p>
        <p>🏫 Địa chỉ: Lớp 22DTHE3. Trường Đại học Công Nghệ TP.HCM</p>
      </section>
    </div>
  );
};

export default About;
