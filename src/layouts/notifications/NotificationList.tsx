import React, { useEffect, useState } from 'react';
import axios from '../../api/axiosConfig';
import './NotificationList.css';

interface Notification {
  MaThongBao: number;
  TieuDe: string;
  NoiDung: string;
  ThoiGianGui: string;
  TenLop?: string;
  NguoiGuiHoTen?: string;
}

const emptyNotification: Partial<Notification> = {
  TieuDe: '',
  NoiDung: '',
  ThoiGianGui: ''
};

const NotificationList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Notification | null>(null);
  const [form, setForm] = useState<Partial<Notification>>(emptyNotification);

  const fetchData = () => {
    setLoading(true);
    axios.get('/thongbao')
      .then(res => {
        setNotifications(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Không thể tải danh sách thông báo.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (item: Notification) => {
    setEditing(item);
    setForm(item);
  };

  const handleCancel = () => {
    setEditing(null);
    setForm(emptyNotification);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.TieuDe || !form.NoiDung) {
      setError('Vui lòng nhập đầy đủ thông tin bắt buộc.');
      return;
    }
    setError(null);
    if (editing) {
      axios.put(`/thongbao/${editing.MaThongBao}`, form)
        .then(() => {
          fetchData();
          setEditing(null);
          setForm(emptyNotification);
        })
        .catch(() => setError('Lỗi cập nhật thông báo'));
    } else {
      axios.post('/thongbao', form)
        .then(() => {
          fetchData();
          setForm(emptyNotification);
        })
        .catch(() => setError('Lỗi thêm thông báo'));
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
      axios.delete(`/thongbao/${id}`)
        .then(() => fetchData())
        .catch(() => setError('Lỗi xóa thông báo'));
    }
  };

  if (loading) return <div className="notification-list-page">Đang tải thông báo...</div>;
  if (error) return <div className="notification-list-page" style={{color:'red'}}>{error}</div>;

  return (
    <div className="notification-list-page">
      <h2>Danh sách thông báo</h2>
      <form className="notification-form" onSubmit={handleSubmit}>
        <input name="TieuDe" value={form.TieuDe || ''} onChange={handleChange} placeholder="Tiêu đề" required />
        <textarea name="NoiDung" value={form.NoiDung || ''} onChange={handleChange} placeholder="Nội dung" required />
        <button type="submit">{editing ? 'Cập nhật' : 'Thêm mới'}</button>
        {editing && <button type="button" onClick={handleCancel}>Hủy</button>}
      </form>
      <table className="notification-table">
        <thead>
          <tr>
            <th>Tiêu đề</th>
            <th>Nội dung</th>
            <th>Lớp</th>
            <th>Người gửi</th>
            <th>Thời gian gửi</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map(item => (
            <tr key={item.MaThongBao}>
              <td>{item.TieuDe}</td>
              <td>{item.NoiDung}</td>
              <td>{item.TenLop || ''}</td>
              <td>{item.NguoiGuiHoTen || ''}</td>
              <td>{item.ThoiGianGui ? new Date(item.ThoiGianGui).toLocaleString() : ''}</td>
              <td>
                <button onClick={() => handleEdit(item)}>Sửa</button>
                <button onClick={() => handleDelete(item.MaThongBao)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NotificationList;
