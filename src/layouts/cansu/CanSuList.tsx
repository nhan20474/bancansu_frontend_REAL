import React, { useEffect, useState } from 'react';
import axios from '../../api/axiosConfig';
import './CanSuList.css';

interface CanSu {
  MaCanSu: number;
  MaLop: number;
  TenLop?: string;
  MaNguoiDung: number;
  TenCanSu?: string;
  ChucVu: string;
  TuNgay: string;
  DenNgay: string;
}

const emptyCanSu: Partial<CanSu> = {
  MaLop: 0,
  MaNguoiDung: 0,
  ChucVu: '',
  TuNgay: '',
  DenNgay: ''
};

const CanSuList: React.FC = () => {
  const [cansu, setCanSu] = useState<CanSu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<CanSu | null>(null);
  const [form, setForm] = useState<Partial<CanSu>>(emptyCanSu);

  const fetchData = () => {
    setLoading(true);
    axios.get('/cansu')
      .then(res => {
        setCanSu(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(
          err.response?.data?.message ||
          'Không thể tải danh sách cán sự.'
        );
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (item: CanSu) => {
    setEditing(item);
    setForm({
      MaLop: item.MaLop,
      MaNguoiDung: item.MaNguoiDung,
      ChucVu: item.ChucVu,
      TuNgay: item.TuNgay ? item.TuNgay.slice(0, 10) : '',
      DenNgay: item.DenNgay ? item.DenNgay.slice(0, 10) : ''
    });
  };

  const handleCancel = () => {
    setEditing(null);
    setForm(emptyCanSu);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.MaLop || !form.MaNguoiDung || !form.ChucVu || !form.TuNgay) {
      setError('Vui lòng nhập đầy đủ thông tin bắt buộc.');
      return;
    }
    setError(null);
    if (editing) {
      axios.put(`/cansu/${editing.MaCanSu}`, form)
        .then(() => {
          fetchData();
          setEditing(null);
          setForm(emptyCanSu);
        })
        .catch(() => setError('Lỗi cập nhật cán sự'));
    } else {
      axios.post('/cansu', form)
        .then(() => {
          fetchData();
          setForm(emptyCanSu);
        })
        .catch(() => setError('Lỗi thêm cán sự'));
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cán sự này?')) {
      axios.delete(`/cansu/${id}`)
        .then(() => fetchData())
        .catch(() => setError('Lỗi xóa cán sự'));
    }
  };

  if (loading) return <div className="cansu-list-page">Đang tải danh sách cán sự...</div>;
  if (error) return <div className="cansu-list-page" style={{color:'red'}}>{error}</div>;

  return (
    <div className="cansu-list-page">
      <h2>Danh sách cán sự</h2>
      <form className="cansu-form" onSubmit={handleSubmit}>
        <input name="MaLop" value={form.MaLop || ''} onChange={handleChange} placeholder="Mã lớp" required />
        <input name="MaNguoiDung" value={form.MaNguoiDung || ''} onChange={handleChange} placeholder="Mã người dùng" required />
        <input name="ChucVu" value={form.ChucVu || ''} onChange={handleChange} placeholder="Chức vụ" required />
        <input name="TuNgay" type="date" value={form.TuNgay || ''} onChange={handleChange} required />
        <input name="DenNgay" type="date" value={form.DenNgay || ''} onChange={handleChange} />
        <button type="submit">{editing ? 'Cập nhật' : 'Thêm mới'}</button>
        {editing && <button type="button" onClick={handleCancel}>Hủy</button>}
      </form>
      <table className="cansu-table">
        <thead>
          <tr>
            <th>Họ tên</th>
            <th>Tên lớp</th>
            <th>Chức vụ</th>
            <th>Từ ngày</th>
            <th>Đến ngày</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {cansu.map(item => (
            <tr key={item.MaCanSu}>
              <td>{item.TenCanSu || ''}</td>
              <td>{item.TenLop || ''}</td>
              <td>{item.ChucVu}</td>
              <td>{item.TuNgay ? new Date(item.TuNgay).toLocaleDateString() : ''}</td>
              <td>{item.DenNgay ? new Date(item.DenNgay).toLocaleDateString() : ''}</td>
              <td>
                <button onClick={() => handleEdit(item)}>Sửa</button>
                <button onClick={() => handleDelete(item.MaCanSu)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CanSuList;
