// src/layouts/user/profile.tsx
import React, { useEffect, useState, useRef } from 'react';
import './ProfilePage.css';
import axios from '../../api/axiosConfig';
import { useUser } from '../../contexts/UserContext';
import { useHistory } from 'react-router-dom';

interface UserProfile {
  MaNguoiDung: number;
  MaSoSV: string;
  HoTen: string;
  VaiTro: string;
  Email: string;
  SoDienThoai: string;
  TrangThai: boolean;
  avatar?: string;
}

const ProfilePage: React.FC = () => {
  const { user, logout } = useUser();
  const history = useHistory();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Đổi mật khẩu
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [pwMsg, setPwMsg] = useState<string | null>(null);

  // Đổi avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  const [avatarMsg, setAvatarMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user || !user.userId) {
      history.replace('/login');
      return;
    }
    axios.get(`/user/profile?userId=${user.userId}`)
      .then(res => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(
          err.response?.data?.message ||
          'Không thể tải hồ sơ cá nhân.'
        );
        setLoading(false);
      });
  }, [user, history]);

  // Xem trước avatar mới
  useEffect(() => {
    if (avatarFile) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(avatarFile);
    } else {
      setAvatarPreview(undefined);
    }
  }, [avatarFile]);

  // Đổi mật khẩu
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (!oldPass || !newPass || !confirmPass) {
      setPwMsg('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    if (newPass !== confirmPass) {
      setPwMsg('Mật khẩu mới không khớp.');
      return;
    }
    try {
      await axios.post('/user/change-password', {
        userId: user?.userId,
        oldPassword: oldPass,
        newPassword: newPass,
      });
      setPwMsg('Đổi mật khẩu thành công!');
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
      setShowChangePassword(false);
    } catch (err: any) {
      setPwMsg(err.response?.data?.message || 'Đổi mật khẩu thất bại.');
    }
  };

  // Đổi avatar
  const handleAvatarChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setAvatarMsg(null);
    if (!avatarFile) {
      setAvatarMsg('Vui lòng chọn ảnh.');
      return;
    }
    if (!user || !user.userId) {
      setAvatarMsg('Không xác định được người dùng.');
      return;
    }
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    formData.append('userId', String(user.userId)); // Sửa ở đây
    try {
      await axios.post('/user/change-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAvatarMsg('Cập nhật avatar thành công!');
      setAvatarFile(null);
      // Reload lại profile
      const res = await axios.get(`/user/profile?userId=${user.userId}`);
      setProfile(res.data);
    } catch (err: any) {
      setAvatarMsg(err.response?.data?.message || 'Cập nhật avatar thất bại.');
    }
  };

  if (!user || !user.userId) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          Không tìm thấy thông tin người dùng hoặc thiếu userId. Vui lòng đăng nhập lại.
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="profile-page">
      <div className="profile-loading">
        <i className="fas fa-spinner fa-spin"></i> Đang tải hồ sơ cá nhân...
      </div>
    </div>
  );
  if (error) return <div className="profile-page"><div className="profile-error">{error}</div></div>;
  if (!profile) return null;

  return (
    <div className="profile-page">
      <div className="profile-content">
        <div className="profile-card">
          <div className="avatar-section">
            <div className="avatar-edit-wrapper">
              <img
                src={avatarPreview || profile.avatar || '/avatar-placeholder.png'}
                alt="avatar"
                className="avatar-img"
                onClick={() => fileInputRef.current?.click()}
                title="Đổi ảnh đại diện"
                style={{ cursor: 'pointer' }}
              />
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={e => {
                  if (e.target.files && e.target.files[0]) setAvatarFile(e.target.files[0]);
                }}
              />
              <button
                className="avatar-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                <i className="fas fa-camera"></i>
              </button>
            </div>
            {avatarFile && (
              <form onSubmit={handleAvatarChange} className="avatar-upload-form">
                <button type="submit" className="profile-btn">Lưu avatar</button>
                <button type="button" className="profile-btn logout" onClick={() => setAvatarFile(null)}>Hủy</button>
                {avatarMsg && <div className="profile-error" style={{marginTop: 8}}>{avatarMsg}</div>}
              </form>
            )}
          </div>
          <div className="info-section">
            <h2>Hồ sơ cá nhân</h2>
            <p><strong>Họ tên:</strong> {profile.HoTen}</p>
            <p><strong>Email:</strong> {profile.Email}</p>
            <p><strong>MSSV:</strong> {profile.MaSoSV}</p>
            <p><strong>SĐT:</strong> {profile.SoDienThoai}</p>
            <p><strong>Vai trò:</strong> {profile.VaiTro}</p>
            <p><strong>Trạng thái:</strong> {profile.TrangThai ? 'Đang hoạt động' : 'Khóa'}</p>
            <div className="profile-actions">
              <button className="profile-btn" onClick={() => setShowChangePassword(v => !v)}>
                <i className="fas fa-key"></i> Đổi mật khẩu
              </button>
              <button className="profile-btn logout" onClick={logout}>
                <i className="fas fa-sign-out-alt"></i> Đăng xuất
              </button>
            </div>
          </div>
        </div>
        {showChangePassword && (
          <form className="change-password-form" onSubmit={handleChangePassword}>
            <h3>Đổi mật khẩu</h3>
            <input
              type="password"
              placeholder="Mật khẩu cũ"
              value={oldPass}
              onChange={e => setOldPass(e.target.value)}
            />
            <input
              type="password"
              placeholder="Mật khẩu mới"
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
            />
            <input
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPass}
              onChange={e => setConfirmPass(e.target.value)}
            />
            <button type="submit" className="profile-btn">
              Xác nhận đổi mật khẩu
            </button>
            {pwMsg && <div className="profile-error" style={{marginTop: 8}}>{pwMsg}</div>}
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
