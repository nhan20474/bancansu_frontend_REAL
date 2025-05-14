// src/layouts/user/profile.tsx
import React from 'react';
import './ProfilePage.css';

const mockUser = {
  name: 'Lê Hoàng Danh',
  email: 'danh@example.com',
  mssv: '12345678',
  phone: '0123456789',
  dob: '2003-01-01',
  class: 'CNTT K14',
  position: 'Lớp trưởng',
  role: 'student',
  avatar: '/uploads/avatar_123.png',
  created_at: '2023-09-01'
};

const Profile: React.FC = () => {
  const user = mockUser; // chỉ dùng mock data

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="avatar-section">
          <img
            src={user.avatar}
            alt="avatar"
            className="avatar-img"
          />
        </div>
        <div className="info-section">
          <h2>Hồ sơ cá nhân</h2>
          <p><strong>Họ tên:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>MSSV:</strong> {user.mssv}</p>
          <p><strong>SĐT:</strong> {user.phone}</p>
          <p><strong>Ngày sinh:</strong> {user.dob}</p>
          <p><strong>Lớp:</strong> {user.class}</p>
          <p><strong>Chức vụ:</strong> {user.position}</p>
          <p><strong>Vai trò:</strong> {user.role}</p>
          <p><strong>Ngày tham gia:</strong> {user.created_at}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
