// src/layouts/user/profile.tsx
import React, { useEffect, useState } from 'react';
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
  avatar?: string; // avatar là optional, nếu backend có thì dùng, không thì bỏ qua
}

const Profile: React.FC = () => {
  const { user } = useUser();
  const history = useHistory();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !user.userId) {
      history.replace('/login');
      return;
    }
    // Gửi userId lên backend qua query string
    axios.get(`/user/profile?userId=${user.userId}`)
      .then(res => {
        setProfile(res.data);
        setLoading(false);
        console.log('Profile data:', res.data); // Xem giá trị TrangThai trả về
      })
      .catch(err => {
        console.error('Lỗi tải hồ sơ:', err, err.response?.data);
        if (err.response?.status === 404) {
          setError('API http://localhost:8080/api/user/profile không tồn tại trên backend. Vui lòng kiểm tra lại backend.');
        } else {
          setError(
            err.response?.data?.message ||
            'Không thể tải hồ sơ cá nhân.'
          );
        }
        setLoading(false);
      });
  }, [user, history]);

  if (!user || !user.userId) {
    return (
      <div className="profile-page">
        <div style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>
          Không tìm thấy thông tin người dùng hoặc thiếu userId. Vui lòng đăng nhập lại.
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="profile-page">
      <div style={{textAlign: 'center', color: '#1e3a8a', fontSize: '1.2rem', marginTop: '2rem'}}>
        <i className="fas fa-spinner fa-spin" style={{marginRight: 8}}></i>
        Đang tải hồ sơ cá nhân...
      </div>
    </div>
  );
  if (error) return <div className="profile-page"><div style={{color:'red'}}>{error}</div></div>;
  if (!profile) return null;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="avatar-section">
          <img
            src={profile.avatar || '/avatar-placeholder.png'}
            alt="avatar"
            className="avatar-img"
          />
        </div>
        <div className="info-section">
          <h2>Hồ sơ cá nhân</h2>
          <p><strong>Họ tên:</strong> {profile.HoTen}</p>
          <p><strong>Email:</strong> {profile.Email}</p>
          <p><strong>MSSV:</strong> {profile.MaSoSV}</p>
          <p><strong>SĐT:</strong> {profile.SoDienThoai}</p>
          <p><strong>Vai trò:</strong> {profile.VaiTro}</p>
          <p><strong>Trạng thái:</strong> {profile.TrangThai ? 'Đang hoạt động' : 'Khóa'}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
