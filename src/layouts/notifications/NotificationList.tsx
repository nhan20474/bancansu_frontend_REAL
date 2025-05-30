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
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);

  // Phân quyền: chỉ admin và giáo viên được thêm/sửa/xóa, còn lại chỉ xem
  function getUserRole(user: any): string {
    if (!user) return '';
    return (
      user.VaiTro ||
      user.role ||
      user.vaitro ||
      user.Role ||
      user.ROLE ||
      ''
    ).toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  }
  const userRole = getUserRole(user);
  // Cho phép cả cán sự được thêm/sửa/xóa
  const canEdit = userRole === 'admin' || userRole === 'giaovien' || userRole === 'cansu';

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
    if (!canEdit) return;
    setEditing(item);
    setForm({
      TieuDe: item.TieuDe,
      NoiDung: item.NoiDung,
      MaLop: item.MaLop,
      link: item.link || '', // giữ lại link khi sửa
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

    if (!canEdit) {
      setError('Bạn không có quyền thực hiện thao tác này.');
      return;
    }

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
    if (form.link !== undefined) {
      formData.set('link', form.link); // luôn lưu lại link khi sửa/thêm
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
    if (!canEdit) {
      setError('Bạn không có quyền xóa thông báo.');
      return;
    }
    if (window.confirm('Bạn có chắc chắn muốn xóa thông báo này không?')) {
      axios.delete(`/thongbao/${id}`)
        .then(() => fetchData())
        .catch(() => setError('Có lỗi khi xóa thông báo.'));
    }
  };

  // Thêm hàm tìm kiếm thông báo
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) {
      fetchData();
      return;
    }
    setSearching(true);
    setError(null);
    try {
      // Tìm kiếm theo tên người gửi hoặc tiêu đề
      const res = await axios.get(`/thongbao/search`, {
        params: { q: search.trim() }
      });
      let data: Notification[] = [];
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data && typeof res.data === 'object') {
        data = [res.data];
      }
      setNotifications(data);
    } catch (err) {
      setError('Không tìm thấy thông báo phù hợp.');
      setNotifications([]);
    }
    setSearching(false);
  };

  // Sắp xếp thông báo mới nhất lên đầu
  const sortedNotifications = [...notifications].sort((a, b) =>
    (b.ThoiGianGui || '').localeCompare(a.ThoiGianGui || '')
  );

  if (loading) return (
    <div className="notification-list-page">
      <div className="form-success">Đang tải danh sách thông báo...</div>
    </div>
  );
  if (error) return (
    <div className="notification-list-page">
      <div className="form-error">{error}</div>
    </div>
  );

  return (
    <div className="notification-list-page notification-feed-page">
      <div className="notification-feed-header">
        <h1>
          <i className="fas fa-bell" style={{color:'#2563eb', marginRight:8}}></i>
          Bảng tin thông báo
        </h1>
        <p>
          Cập nhật các thông báo mới nhất từ hệ thống, lớp học, cán sự. Nhấn vào từng thông báo để xem chi tiết hoặc mở liên kết liên quan.
        </p>
        {/* Thanh tìm kiếm thông báo */}
        <form
          onSubmit={handleSearch}
          style={{ display: 'flex', gap: 10, maxWidth: 400, margin: '0 auto 18px auto' }}
        >
          <input
            type="text"
            placeholder="Tìm kiếm theo tên người gửi hoặc tiêu đề..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1,
              padding: '0.55rem 0.9rem',
              borderRadius: 7,
              border: '1.5px solid #2563eb',
              fontSize: '1.05rem',
              background: '#f9fafe'
            }}
            disabled={loading || searching}
          />
          <button
            type="submit"
            className="action-btn"
            style={{
              background: '#2563eb',
              color: '#fff',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: '1rem',
              padding: '8px 18px',
              border: 'none'
            }}
            disabled={loading || searching}
          >
            <i className="fas fa-search"></i> Tìm kiếm
          </button>
          {search && (
            <button
              type="button"
              className="action-btn delete"
              style={{
                background: '#e0e7ef',
                color: '#2563eb',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: '1rem',
                padding: '8px 12px',
                border: 'none'
              }}
              onClick={() => {
                setSearch('');
                fetchData();
              }}
              disabled={loading || searching}
              title="Xóa tìm kiếm"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </form>
        {canEdit && (
          <button className="feed-add-btn" title="Thêm thông báo mới" onClick={() => { setShowForm(true); setEditing(null); setForm({ ...emptyNotification }); setImagePreview(undefined); }}>
            <i className="fas fa-plus"></i> Đăng thông báo mới
          </button>
        )}
      </div>
      {showForm && canEdit && (
        <form className="notification-form" onSubmit={handleFormSubmit} encType="multipart/form-data" style={{margin:'0 auto 24px auto', maxWidth:420}}>
          <h3 style={{textAlign:'center', color:'#2563eb', marginBottom:10}}>{editing ? 'Cập nhật thông báo' : 'Đăng thông báo mới'}</h3>
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
          <div style={{display:'flex', gap:8, justifyContent:'center', marginTop:8}}>
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
          </div>
        </form>
      )}
      <div className="notification-feed-list">
        {sortedNotifications.length === 0 && (
          <div className="form-error" style={{margin:'0 auto', maxWidth:400, textAlign:'center'}}>Không có thông báo nào.</div>
        )}
        {sortedNotifications.map(item => (
          <div className="notification-feed-card" key={item.MaThongBao}>
            <div className="feed-card-header">
              <div className="feed-avatar">
                <i className="fas fa-user-circle"></i>
              </div>
              <div className="feed-meta">
                <span className="feed-sender">{item.TenNguoiGui}</span>
                <span className="feed-time">{item.ThoiGianGui ? new Date(item.ThoiGianGui).toLocaleString('vi-VN') : ''}</span>
              </div>
              <div className="feed-actions">
                {canEdit && (
                  <>
                    <button
                      className="action-btn"
                      title="Chỉnh sửa"
                      onClick={() => handleEdit(item)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="action-btn delete"
                      title="Xóa"
                      onClick={() => handleDelete(item.MaThongBao)}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="feed-card-body">
              <div className="feed-title" dangerouslySetInnerHTML={{ __html: item.TieuDe }} />
              <div className="feed-content" dangerouslySetInnerHTML={{ __html: item.NoiDung }} />
              {item.link && (
                <div className="feed-link">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {/* Đổi biểu tượng thành chữ "Tham gia" */}
                    Tham gia
                  </a>
                </div>
              )}
              {item.AnhDinhKemUrl && (
                <div className="feed-image-wrap">
                  <img
                    src={item.AnhDinhKemUrl}
                    alt="Ảnh đính kèm"
                    className="feed-image"
                    onError={e => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              {item.TepDinhKem && (
                <div className="feed-link">
                  <a
                    href={item.TepDinhKem}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fas fa-paperclip"></i> {item.TepDinhKem}
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationList;
