/**
 * ProfilePage: Displays and allows editing of user profile and avatar.
 */
import React, { useEffect, useState, useRef } from 'react';
import './ProfilePage.css';
import axios from '../../api/axiosConfig';
import { useUser } from '../../contexts/UserContext';
import { useHistory, Link } from 'react-router-dom';

interface UserProfile {
  MaNguoiDung: number;
  MaSoSV: string;
  HoTen: string;
  VaiTro: string;
  Email: string;
  SoDienThoai: string;
  TrangThai: boolean;
  avatar?: string;
  HinhAnh?: string;
  normalized?: string;
}

const ProfilePage: React.FC = () => {
  const { user, logout, setUser } = useUser();
  const history = useHistory();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  const [avatarMsg, setAvatarMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hàm lấy URL ảnh đại diện chuẩn
  function getAvatarUrl(profile: UserProfile, user: any, preview?: string): string {
    if (preview) return preview;
    if (profile.normalized && typeof profile.normalized === 'string' && profile.normalized.trim() !== '') {
      return profile.normalized;
    }
    if (profile.avatar && profile.avatar.startsWith('http')) {
      return profile.avatar;
    }
    // Ưu tiên profile.HinhAnh nếu có
    if (profile.HinhAnh && profile.HinhAnh.trim() !== '') {
      // Loại bỏ mọi tiền tố App/, App\, uploads/, uploads\, /uploads/, \uploads\
      const file = profile.HinhAnh.replace(/^(App[\\/])?(uploads[\\/])?/i, '').replace(/^[/\\]+/, '');
      return `http://localhost:8080/uploads/${file}`;
    }
    if (profile.avatar && profile.avatar.trim() !== '') {
      const file = profile.avatar.replace(/^(App[\\/])?(uploads[\\/])?/i, '').replace(/^[/\\]+/, '');
      return `http://localhost:8080/uploads/${file}`;
    }
    if (user?.avatar && user.avatar.startsWith('http')) {
      return user.avatar;
    }
    return '/avatar-placeholder.png';
  }

  useEffect(() => {
    if (!user || !user.userId) {
      history.replace('/login');
      return;
    }
    setLoading(true);
    setError(null);
    axios
      .get(`/user/profile?userId=${user.userId}`)
      .then(res => {
        const data = res.data;
        setProfile(data);
        setLoading(false);
        // Log để kiểm tra dữ liệu trả về
        console.log('API trả về:', data);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Không thể tải hồ sơ cá nhân.');
        setLoading(false);
      });
  }, [user, history]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setAvatarMsg('Không có tệp nào được chọn');
      return;
    }
    const file = e.target.files[0];
    if (!file.type.startsWith('image/')) {
      setAvatarMsg('Vui lòng chọn tệp hình ảnh');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarMsg('Tệp ảnh quá lớn (tối đa 5MB)');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('userId', String(user?.userId || ''));

    setUploading(true);
    setAvatarMsg(null);
    try {
      const response = await fetch('http://localhost:8080/api/user/upload-avatar', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      if (!response.ok) {
        throw new Error('Tải lên thất bại');
      }
      const data = await response.json();
      let avatarValue = '';
      let hinhAnhValue = '';
      if (data.success && data.user) {
        // Ưu tiên normalized nếu backend trả về
        if (data.user.normalized && typeof data.user.normalized === 'string' && data.user.normalized.trim() !== '') {
          avatarValue = data.user.normalized;
        } else if (data.user.avatar && data.user.avatar.startsWith('http')) {
          avatarValue = data.user.avatar;
        } else if (data.user.avatar && data.user.avatar.trim() !== '') {
          // Loại bỏ mọi tiền tố App/, App\, uploads/, uploads\, /uploads/, \uploads\
          const file = data.user.avatar.replace(/^(App[\\/])?(uploads[\\/])?/i, '').replace(/^[/\\]+/, '');
          avatarValue = `http://localhost:8080/uploads/${file}`;
        } else if (data.user.HinhAnh && data.user.HinhAnh.trim() !== '') {
          const file = data.user.HinhAnh.replace(/^(App[\\/])?(uploads[\\/])?/i, '').replace(/^[/\\]+/, '');
          avatarValue = `http://localhost:8080/uploads/${file}`;
        } else {
          avatarValue = '/avatar-placeholder.png';
        }
        hinhAnhValue = data.user.HinhAnh || '';
        setUser({ ...data.user, avatar: avatarValue, HinhAnh: hinhAnhValue });
        setProfile(prev =>
          prev
            ? { ...prev, ...data.user, avatar: avatarValue, HinhAnh: hinhAnhValue }
            : { ...data.user, avatar: avatarValue, HinhAnh: hinhAnhValue }
        );
        localStorage.setItem('user', JSON.stringify({ ...data.user, avatar: avatarValue, HinhAnh: hinhAnhValue }));
      } else if (data.url) {
        // Loại bỏ mọi tiền tố App/, App\, uploads/, uploads\, /uploads/, \uploads\
        const file = data.url.replace(/^(App[\\/])?(uploads[\\/])?/i, '').replace(/^[/\\]+/, '');
        avatarValue = data.url.startsWith('http') ? data.url : `http://localhost:8080/uploads/${file}`;
        setUser({ ...user!, avatar: avatarValue });
        setProfile(prev => prev ? { ...prev, avatar: avatarValue } : prev);
        localStorage.setItem('user', JSON.stringify({ ...user, avatar: avatarValue }));
      } else {
        throw new Error('Phản hồi từ server không hợp lệ');
      }
      setAvatarMsg('Cập nhật avatar thành công!');
      setAvatarPreview(undefined);
      setProfile(prev => prev ? { ...prev, avatar: avatarValue, HinhAnh: hinhAnhValue } : prev);
    } catch (err: any) {
      setAvatarMsg(`Cập nhật avatar thất bại: ${err.message}`);
      setAvatarPreview(undefined);
    } finally {
      setUploading(false);
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
  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <i className="fas fa-spinner fa-spin"></i> Đang tải hồ sơ cá nhân...
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-error">{error}</div>
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          Không thể tải hồ sơ. Vui lòng thử lại sau.
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-content">
        <div className="profile-card">
          <div className="avatar-section">
            <div
              style={{
                width: 120,
                height: 120,
                background: '#e0e7ef',
                borderRadius: '50%',
                border: '3px solid #1e3a8a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                margin: '0 auto 12px auto',
              }}
            >
              <img
                src={getAvatarUrl(profile, user, avatarPreview)}
                alt="Avatar"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%',
                  background: '#e0e7ef',
                }}
                onClick={() => fileInputRef.current?.click()}
                title="Đổi ảnh đại diện"
                onError={e => {
                  if ((e.target as HTMLImageElement).src.indexOf('/avatar-placeholder.png') === -1) {
                    (e.target as HTMLImageElement).src = '/avatar-placeholder.png';
                  }
                }}
              />
            </div>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleAvatarChange}
              disabled={uploading}
            />
            <button
              className="avatar-upload-btn"
              onClick={() => fileInputRef.current?.click()}
              type="button"
              disabled={uploading}
            >
              <i className="fas fa-camera"></i>
            </button>
            {uploading && <span>Đang tải lên...</span>}
            {avatarMsg && <div className="profile-error" style={{ marginTop: 8 }}>{avatarMsg}</div>}
          </div>
          <div className="info-section">
            <h2>Hồ sơ cá nhân</h2>
            <p><strong>Họ tên:</strong> {profile.HoTen}</p>
            <p><strong>Email:</strong> {profile.Email}</p>
            <p><strong>MSSV:</strong> {profile.MaSoSV}</p>
            <p><strong>SĐT:</strong> {profile.SoDienThoai}</p>
            <p><strong>Vai trò:</strong> {profile.VaiTro}</p>
            <p><strong>Trạng thái:</strong> {profile.TrangThai === false ? 'Khóa' : 'Đang hoạt động'}</p>
            <div className="profile-actions">
              <Link className="profile-btn" to="/change-password">
                <i className="fas fa-key"></i> Đổi mật khẩu
              </Link>
              <button className="profile-btn logout" onClick={logout}>
                <i className="fas fa-sign-out-alt"></i> Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;