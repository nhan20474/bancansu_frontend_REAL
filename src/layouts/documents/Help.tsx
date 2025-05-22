// src/pages/Help.tsx
/**
 * Help page: Frequently asked questions and support information.
 */
import React from 'react';
import './Help.css';

const Help: React.FC = () => {
  return (
    <div className="help-container">
      <h1>Trợ giúp & Hướng dẫn</h1>

      <section className="help-section">
        <h2>Câu hỏi thường gặp</h2>
        <ul>
          <li><strong>🔐 Làm sao để đăng nhập?</strong> – Vào trang Đăng nhập và nhập email + mật khẩu được cấp.</li>
          <li><strong>📚 Làm sao để xem tài liệu?</strong> – Vào mục Tài liệu, bạn có thể lọc theo môn học hoặc tìm kiếm tiêu đề.</li>
          <li><strong>📩 Tôi gặp lỗi khi thao tác?</strong> – Vui lòng chụp màn hình và liên hệ với BCS hoặc bộ phận kỹ thuật.</li>
        </ul>
      </section>

      <section className="help-section">
        <h2>Hướng dẫn sử dụng</h2>
        <ol>
          <li>Vào trang chủ và kiểm tra thông báo quan trọng.</li>
          <li>Sử dụng menu bên trái để truy cập vào các chức năng như lớp học, diễn đàn, tài liệu, v.v.</li>
          <li>Kiểm tra thường xuyên mục Nhắc nhở để không bỏ lỡ các hoạt động.</li>
        </ol>
      </section>

      <section className="help-section">
        <h2>Liên hệ hỗ trợ</h2>
        <p>📞 Hotline: 0123 456 789</p>
        <p>📧 Email: support@classmanager.edu.vn</p>
        <p>🏢 Văn phòng: Phòng B002, Trường Đại học Công Nghệ TP.HCM</p>
      </section>
    </div>
  );
};

export default Help;
