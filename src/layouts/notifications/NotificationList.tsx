/**
 * NotificationList: Manage and display notifications for classes.
 */
import React, { useEffect, useState, useRef } from 'react';
import axios from '../../api/axiosConfig';
import './NotificationList.css';
import { Link } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

/**
 * Notification: Interface for notification data.
 */
interface Notification {
  MaThongBao: number;
  MaLop: number;
  TenLop: string;
  NguoiGui: number;
  TenNguoiGui: string;
  TieuDe: string;
  NoiDung: string;
  ThoiGianGui: string;
  AnhDinhKem?: string | null;
  AnhDinhKemUrl?: string; // URL đầy đủ cho ảnh
  link?: string; // Thêm trường link
  TepDinhKem?: string | null;
}

const emptyNotification: Partial<Notification> = {
  TieuDe: '',
  NoiDung: '',
  MaLop: 0,
  TenLop: '',
  NguoiGui: 0,
  TenNguoiGui: '',
  ThoiGianGui: '',
  AnhDinhKem: null,
  AnhDinhKemUrl: '',
  link: '' // Thêm trường link
};

function getImageUrl(anh: string | null | undefined): string {
  if (!anh || anh === 'null' || anh.trim() === '') return '';
  // Nếu backend đã trả về URL đầy đủ (bắt đầu bằng http), dùng luôn
  if (anh.startsWith('http')) return anh;
  // Luôn trả về đúng host:port backend (không lấy theo window.location)
  return `http://localhost:8080/uploads/${anh.replace(/^\/?uploads\//, '')}`;
}

const NotificationList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Notification | null>(null);
  const [form, setForm] = useState<Partial<Notification> & { AnhDinhKem?: string | File | null }>({ ...emptyNotification });
  const [showForm, setShowForm] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [classes, setClasses] = useState<{ MaLop: number, TenLop: string }[]>([]);
  const { user } = useUser();

  const fetchData = () => {
    setLoading(true);
    axios.get('/thongbao')
      .then(res => {
        // Sử dụng trường AnhDinhKemUrl từ backend, nếu có thì dùng, không thì undefined
        const data = Array.isArray(res.data) ? res.data : [];
        setNotifications(
          data.map((item: Notification & { AnhDinhKemUrl?: string | null }) => ({
            ...item,
            AnhDinhKemUrl: item.AnhDinhKemUrl && typeof item.AnhDinhKemUrl === 'string' && item.AnhDinhKemUrl.trim() !== ''
              ? item.AnhDinhKemUrl
              : (item.AnhDinhKem && typeof item.AnhDinhKem === 'string' && item.AnhDinhKem.trim() !== '' && item.AnhDinhKem !== 'null'
                  ? getImageUrl(item.AnhDinhKem)
                  : undefined)
          }))
        );
        setLoading(false);
      })
      .catch(err => {
        setError(
          err.response?.data?.message ||
          'Không thể tải danh sách thông báo.'
        );
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
    // Giả sử gọi API để lấy danh sách lớp
    axios.get('/lop')
      .then(res => {
        setClasses(res.data);
      })
      .catch(err => {
        setError('Không thể tải danh sách lớp.');
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Chỉ giữ lại các trường thực sự thuộc Notification, loại bỏ AnhDinhKemUrl (vì không phải field submit)
      setForm(prev => {
        const { AnhDinhKemUrl, ...rest } = prev as any;
        return {
          ...rest,
          AnhDinhKem: file
        } as Partial<Notification> & { AnhDinhKem?: string | File | null };
      });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setForm(prev => {
        const { AnhDinhKemUrl, ...rest } = prev as any;
        return {
          ...rest,
          AnhDinhKem: editing ? editing.AnhDinhKem || null : null
        } as Partial<Notification> & { AnhDinhKem?: string | File | null };
      });
      setImagePreview(undefined);
    }
  };

  const handleEdit = (item: Notification) => {
    setEditing(item);
    setForm({
      TieuDe: item.TieuDe,
      NoiDung: item.NoiDung,
      MaLop: item.MaLop,
      link: item.link || '', // đảm bảo trường link được set vào form khi sửa
      ThoiGianGui: item.ThoiGianGui ? item.ThoiGianGui.slice(0, 10) : '',
      AnhDinhKem: item.AnhDinhKem || null
    });
    setImagePreview(item.AnhDinhKemUrl || (item.AnhDinhKem && item.AnhDinhKem.startsWith('http') ? item.AnhDinhKem : getImageUrl(item.AnhDinhKem)));
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditing(null);
    setForm({ ...emptyNotification });
    setError(null);
    setShowForm(false);
    setImagePreview(undefined);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Kiểm tra tất cả trường bắt buộc
    if (
      !form.TieuDe ||
      !form.NoiDung ||
      !form.MaLop
    ) {
      setError('Vui lòng nhập đầy đủ các trường: Tiêu đề, Nội dung, Mã lớp.');
      return;
    }
    setError(null);

    const formData = new FormData();
    formData.append('TieuDe', form.TieuDe || '');
    formData.append('NoiDung', form.NoiDung || '');
    formData.append('MaLop', form.MaLop ? String(form.MaLop) : '');
    formData.append('NguoiGui', user?.userId ? String(user.userId) : '');
    if (form.AnhDinhKem) {
      if (typeof form.AnhDinhKem === 'string') {
        formData.append('AnhDinhKemCu', form.AnhDinhKem);
      } else {
        formData.append('AnhDinhKem', form.AnhDinhKem);
      }
    }
    if (form.link) {
      formData.append('link', form.link);
    }

    try {
      if (editing) {
        await axios.put(`/thongbao/${editing.MaThongBao}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post('/thongbao', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      fetchData();
      setEditing(null);
      setForm({ ...emptyNotification });
      setShowForm(false);
      setImagePreview(undefined);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        (editing ? 'Có lỗi khi cập nhật thông báo.' : 'Có lỗi khi thêm thông báo mới.')
      );
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thông báo này không?')) {
      axios.delete(`/thongbao/${id}`)
        .then(() => fetchData())
        .catch(() => setError('Có lỗi khi xóa thông báo.'));
    }
  };

  if (loading) return <div className="notification-list-page">Đang tải danh sách thông báo...</div>;
  if (error) return <div className="notification-list-page" style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="notification-list-page notification-grid-page">
      <h2>Danh sách thông báo</h2>
      <div style={{ marginBottom: 16 }}>
        
      </div>
      {showForm && (
        <form className="notification-form" onSubmit={handleFormSubmit} encType="multipart/form-data">
          <input
            name="TieuDe"
            value={form.TieuDe || ''}
            onChange={handleChange}
            placeholder="Nhập tiêu đề thông báo"
            required
          />
          <textarea
            name="NoiDung"
            value={form.NoiDung || ''}
            onChange={handleChange}
            placeholder="Nhập nội dung thông báo"
            rows={4}
            required
          />
          <select
            name="MaLop"
            value={form.MaLop || ''}
            onChange={handleChange}
            required
          >
            <option value="">--Chọn lớp--</option>
            {classes.map(lop => (
              <option key={lop.MaLop} value={lop.MaLop}>
                {lop.TenLop}
              </option>
            ))}
          </select>
          <input
            name="link"
            value={form.link || ''}
            onChange={handleChange}
            placeholder="Đường dẫn liên quan (nếu có)"
            type="url"
            style={{ marginBottom: 12 }}
          />
          <input
            type="file"
            name="AnhDinhKem"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
            title="Chọn ảnh đính kèm"
          />
          {/* Hiển thị preview ảnh khi chọn file hoặc khi sửa */}
          {(imagePreview || (editing && typeof form.AnhDinhKem === 'string' && form.AnhDinhKem)) && (
            <div style={{ margin: '8px 0', textAlign: 'center' }}>
              <img
                src={imagePreview || (typeof form.AnhDinhKem === 'string' && form.AnhDinhKem.startsWith('http')
                  ? form.AnhDinhKem
                  : getImageUrl(form.AnhDinhKem as string))}
                alt="Ảnh đính kèm"
                style={{ maxWidth: 180, maxHeight: 120, borderRadius: 8, border: '1px solid #eee', objectFit: 'cover' }}
                onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div style={{ fontSize: 13, color: '#888' }}>Ảnh đính kèm hiện tại</div>
            </div>
          )}
          <button type="submit" className="action-btn" title={editing ? "Lưu thay đổi" : "Thêm thông báo"}>
            <i className={editing ? "fas fa-save" : "fas fa-plus"}></i> {editing ? "Lưu" : "Thêm mới"}
          </button>
          {editing && (
            <button
              type="button"
              className="action-btn delete"
              title="Hủy chỉnh sửa"
              onClick={handleCancel}
            >
              <i className="fas fa-times"></i> Hủy
            </button>
          )}
        </form>
      )}
      <button className="action-btn" title="Thêm thông báo mới" onClick={() => { setShowForm(true); setEditing(null); setForm({ ...emptyNotification }); setImagePreview(undefined); }}>
        <i className="fas fa-plus"></i> Thêm mới
      </button>
      <div className="notification-grid">
        {notifications.map(item => (
          <div className="notification-card" key={item.MaThongBao}>
            <div className="notification-img-wrap">
              {item.AnhDinhKemUrl
                ? <img
                    src={item.AnhDinhKemUrl}
                    alt="Ảnh đính kèm"
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    onError={e => {
                      // Nếu ảnh lỗi, ẩn ảnh và hiện icon chuông
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="notification-img-placeholder"><i class="fas fa-bell"></i></div>';
                      }
                    }}
                  />
                : <div className="notification-img-placeholder"><i className="fas fa-bell"></i></div>
              }
            </div>
            <div className="notification-card-body">
              <h3 className="notification-title">
                <span
                  // Cho phép hiển thị emoji hoặc icon trong tiêu đề
                  dangerouslySetInnerHTML={{ __html: item.TieuDe }}
                />
              </h3>
              <div className="notification-meta">
                <span className="notification-sender">Người gửi: {item.TenNguoiGui}</span>
                <span className="notification-time">{item.ThoiGianGui ? new Date(item.ThoiGianGui).toLocaleString('vi-VN') : ''}</span>
              </div>
              <div className="notification-content">
                <span
                  // Cho phép hiển thị emoji hoặc icon trong nội dung
                  dangerouslySetInnerHTML={{ __html: item.NoiDung }}
                />
              </div>
              {item.link && (
                <div className="notification-link">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#2563eb', textDecoration: 'underline', wordBreak: 'break-all' }}
                  >
                    {item.link}
                  </a>
                </div>
              )}
              <div className="notification-actions">
                <button
                  className="action-btn"
                  title="Chỉnh sửa thông báo"
                  onClick={() => handleEdit(item)}
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  className="action-btn delete"
                  title="Xóa thông báo"
                  onClick={() => handleDelete(item.MaThongBao)}
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
                {item.AnhDinhKemUrl &&
                  <a
                    href={item.AnhDinhKemUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-btn"
                    title="Xem ảnh đính kèm"
                  >
                    <i className="fas fa-image"></i>
                  </a>
                }
                {item.TepDinhKem && (
                  <div className="notification-link">
                    <a
                      href={item.TepDinhKem}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#2563eb', textDecoration: 'underline', wordBreak: 'break-all' }}
                      title="Mở đường dẫn"
                    >
                      {item.TepDinhKem}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationList;
