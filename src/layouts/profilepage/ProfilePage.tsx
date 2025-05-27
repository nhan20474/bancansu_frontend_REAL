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
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ Email: '', SoDienThoai: '' });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
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
    if (profile.HinhAnh && profile.HinhAnh.trim() !== '') {
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
        setEditForm({ Email: data.Email || '', SoDienThoai: data.SoDienThoai || '' });
        setLoading(false);
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
        if (data.user.normalized && typeof data.user.normalized === 'string' && data.user.normalized.trim() !== '') {
          avatarValue = data.user.normalized;
        } else if (data.user.avatar && data.user.avatar.startsWith('http')) {
          avatarValue = data.user.avatar;
        } else if (data.user.avatar && data.user.avatar.trim() !== '') {
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

  const handleEditToggle = () => {
    if (isEditing) {
      setEditForm({ 
        Email: profile?.Email || '', 
        SoDienThoai: profile?.SoDienThoai || '' 
      });
      setSaveMsg(null);
    }
    setIsEditing(!isEditing);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,11}$/;

    if (!editForm.Email.trim()) {
      setSaveMsg('Email không được để trống');
      return false;
    }

    if (!emailRegex.test(editForm.Email)) {
      setSaveMsg('Email không hợp lệ');
      return false;
    }

    if (!editForm.SoDienThoai.trim()) {
      setSaveMsg('Số điện thoại không được để trống');
      return false;
    }

    if (!phoneRegex.test(editForm.SoDienThoai)) {
      setSaveMsg('Số điện thoại phải có 10-11 chữ số');
      return false;
    }

    return true;
  };

  const handleSaveProfile = async () => {
    setSaveMsg(null);
    
    if (!validateForm()) return;

    setSaving(true);
    try {
      const response = await axios.put('/user/profile', {
        userId: user?.userId,
        Email: editForm.Email.trim(),
        SoDienThoai: editForm.SoDienThoai.trim()
      });

      if (response.data.success) {
        setProfile(prev => prev ? { 
          ...prev, 
          Email: editForm.Email.trim(), 
          SoDienThoai: editForm.SoDienThoai.trim() 
        } : prev);
        
        if (user) {
          setUser({
            ...user,
            email: editForm.Email.trim()
          });
        }
        
        setSaveMsg('Cập nhật thông tin thành công!');
        setIsEditing(false);
      } else {
        setSaveMsg(response.data.message || 'Cập nhật thất bại');
      }
    } catch (err: any) {
      setSaveMsg(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  if (!user || !user.userId) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          <div className="error-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h3>Không tìm thấy thông tin người dùng</h3>
          <p>Vui lòng đăng nhập lại để tiếp tục</p>
          <Link to="/login" className="profile-btn primary">
            <i className="fas fa-sign-in-alt"></i>
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <h3>Đang tải hồ sơ cá nhân...</h3>
          <p>Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          <div className="error-icon">
            <i className="fas fa-exclamation-circle"></i>
          </div>
          <h3>Có lỗi xảy ra</h3>
          <p>{error}</p>
          <button 
            className="profile-btn secondary" 
            onClick={() => window.location.reload()}
          >
            <i className="fas fa-refresh"></i>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          <div className="error-icon">
            <i className="fas fa-user-slash"></i>
          </div>
          <h3>Không thể tải hồ sơ</h3>
          <p>Vui lòng thử lại sau</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="page-header">
          <h2>Hồ sơ cá nhân</h2>
          <p>Quản lý thông tin tài khoản và cài đặt cá nhân của bạn</p>
        </div>

        <div className="profile-layout">
          {/* Avatar & Basic Info Card */}
          <div className="profile-sidebar">
            <div className="avatar-card">
              <div className="avatar-section">
                <div className="avatar-wrapper">
                  <div className="avatar-container">
                    <img
                      src={getAvatarUrl(profile, user, avatarPreview)}
                      alt="Avatar"
                      className="avatar-img"
                      onClick={() => fileInputRef.current?.click()}
                      title="Nhấn để thay đổi ảnh đại diện"
                      onError={e => {
                        if ((e.target as HTMLImageElement).src.indexOf('/avatar-placeholder.png') === -1) {
                          (e.target as HTMLImageElement).src = '/avatar-placeholder.png';
                        }
                      }}
                    />
                    <div className="avatar-overlay" onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer' }}>
                      <i className="fas fa-camera"></i>
                      <span>Thay đổi</span>
                    </div>
                  </div>
                  
                  <button
                    className="avatar-upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    title="Thay đổi ảnh đại diện"
                  >
                    <i className="fas fa-camera"></i>
                    Thay đổi ảnh
                  </button>
                  
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    disabled={uploading}
                  />
                </div>

                {uploading && (
                  <div className="upload-status">
                    <div className="upload-spinner">
                      <div className="spinner small"></div>
                    </div>
                    <span>Đang tải lên...</span>
                  </div>
                )}
                
                {avatarMsg && (
                  <div className={`avatar-message ${avatarMsg.includes('thành công') ? 'success' : 'error'}`}>
                    <i className={`fas ${avatarMsg.includes('thành công') ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                    <span>{avatarMsg}</span>
                  </div>
                )}
              </div>

              <div className="basic-info">
                <h2>{profile.HoTen}</h2>
                <div className="role-badge">
                  <i className="fas fa-user-tag"></i>
                  {profile.VaiTro}
                </div>
                <div className="student-id">
                  <i className="fas fa-id-card"></i>
                  <span>MSSV: {profile.MaSoSV}</span>
                </div>
                <div className="status-badge active">
                  <i className="fas fa-circle"></i>
                  <span>Đang hoạt động</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-card">
              <h3>
                <i className="fas fa-bolt"></i>
                Thao tác nhanh
              </h3>
              <div className="actions-list">
                <Link className="action-item" to="/change-password">
                  <div className="action-icon">
                    <i className="fas fa-key"></i>
                  </div>
                  <div className="action-content">
                    <span className="action-title">Đổi mật khẩu</span>
                    <span className="action-desc">Cập nhật mật khẩu bảo mật</span>
                  </div>
                  <i className="fas fa-chevron-right"></i>
                </Link>
                
                <button className="action-item logout-action" onClick={logout}>
                  <div className="action-icon">
                    <i className="fas fa-sign-out-alt"></i>
                  </div>
                  <div className="action-content">
                    <span className="action-title">Đăng xuất</span>
                    <span className="action-desc">Thoát khỏi tài khoản</span>
                  </div>
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="profile-main">
            {/* Personal Information Card */}
            <div className="info-card">
              <div className="card-header">
                <div className="header-left">
                  <h2>
                    <i className="fas fa-user"></i>
                    Thông tin cá nhân
                  </h2>
                  <p>Quản lý thông tin liên hệ và các chi tiết cá nhân</p>
                </div>
                <button
                  className={`edit-toggle-btn ${isEditing ? 'cancel' : 'edit'}`}
                  onClick={handleEditToggle}
                  disabled={saving}
                >
                  {isEditing ? (
                    <>
                      <i className="fas fa-times"></i>
                      Hủy bỏ
                    </>
                  ) : (
                    <>
                      <i className="fas fa-edit"></i>
                      Chỉnh sửa
                    </>
                  )}
                </button>
              </div>

              {saveMsg && (
                <div className={`save-notification ${saveMsg.includes('thành công') ? 'success' : 'error'}`}>
                  <div className="notification-icon">
                    <i className={`fas ${saveMsg.includes('thành công') ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                  </div>
                  <span>{saveMsg}</span>
                </div>
              )}

              <div className="info-grid">
                <div className="info-group">
                  <h4>Thông tin cơ bản</h4>
                  <div className="info-fields">
                    <div className="info-field readonly">
                      <label>
                        <i className="fas fa-user"></i>
                        Họ và tên
                      </label>
                      <div className="field-value">
                        {profile.HoTen}
                      </div>
                    </div>

                    <div className="info-field readonly">
                      <label>
                        <i className="fas fa-id-card"></i>
                        Mã số sinh viên
                      </label>
                      <div className="field-value">
                        {profile.MaSoSV}
                      </div>
                    </div>

                    <div className="info-field readonly">
                      <label>
                        <i className="fas fa-user-tag"></i>
                        Vai trò
                      </label>
                      <div className="field-value">
                        <span className="role-tag">{profile.VaiTro}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="info-group">
                  <h4>Thông tin liên hệ</h4>
                  <div className="info-fields">
                    <div className={`info-field ${isEditing ? 'editable' : ''}`}>
                      <label>
                        <i className="fas fa-envelope"></i>
                        Địa chỉ email
                      </label>
                      {isEditing ? (
                        <div className="field-input">
                          <input
                            type="email"
                            name="Email"
                            value={editForm.Email}
                            onChange={handleFormChange}
                            placeholder="Nhập địa chỉ email"
                            required
                          />
                        </div>
                      ) : (
                        <div className="field-value">
                          {profile.Email}
                        </div>
                      )}
                    </div>

                    <div className={`info-field ${isEditing ? 'editable' : ''}`}>
                      <label>
                        <i className="fas fa-phone"></i>
                        Số điện thoại
                      </label>
                      {isEditing ? (
                        <div className="field-input">
                          <input
                            type="tel"
                            name="SoDienThoai"
                            value={editForm.SoDienThoai}
                            onChange={handleFormChange}
                            placeholder="Nhập số điện thoại"
                            required
                          />
                        </div>
                      ) : (
                        <div className="field-value">
                          {profile.SoDienThoai}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="edit-actions">
                  <button
                    className="profile-btn secondary"
                    onClick={handleEditToggle}
                    disabled={saving}
                  >
                    <i className="fas fa-times"></i>
                    Hủy bỏ
                  </button>
                  <button
                    className="profile-btn primary"
                    onClick={handleSaveProfile}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="spinner small"></div>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save"></i>
                        Lưu thay đổi
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;