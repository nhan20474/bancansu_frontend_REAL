import React, { useEffect, useState } from 'react';
import axios from '../../api/axiosConfig';
import './ClassList.css';

interface ClassItem {
  MaLop: number;
  MaLopHoc: string;
  TenLop: string;
  ChuyenNganh: string;
  KhoaHoc: string;
  TenGiaoVien?: string;
}

const emptyClass: Partial<ClassItem> = {
  MaLopHoc: '',
  TenLop: '',
  ChuyenNganh: '',
  KhoaHoc: ''
};

const ClassList: React.FC = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ClassItem | null>(null);
  const [form, setForm] = useState<Partial<ClassItem>>(emptyClass);

  const fetchData = () => {
    setLoading(true);
    axios.get('/lop')
      .then(res => {
        setClasses(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Không thể tải danh sách lớp học.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (item: ClassItem) => {
    setEditing(item);
    setForm({
      MaLopHoc: item.MaLopHoc,
      TenLop: item.TenLop,
      ChuyenNganh: item.ChuyenNganh,
      KhoaHoc: item.KhoaHoc
    });
  };

  const handleCancel = () => {
    setEditing(null);
    setForm(emptyClass);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.MaLopHoc || !form.TenLop || !form.ChuyenNganh || !form.KhoaHoc) {
      setError('Vui lòng nhập đầy đủ thông tin bắt buộc.');
      return;
    }
    setError(null);
    if (editing) {
      axios.put(`/lop/${editing.MaLop}`, form)
        .then(() => {
          fetchData();
          setEditing(null);
          setForm(emptyClass);
        })
        .catch(err => {
          console.error('Lỗi cập nhật:', err, err.response?.data);
          setError(err.response?.data?.message || 'Lỗi cập nhật lớp học');
        });
    } else {
      axios.post('/lop', form)
        .then(() => {
          fetchData();
          setForm(emptyClass);
        })
        .catch(err => {
          console.error('Lỗi thêm mới:', err, err.response?.data);
          setError(err.response?.data?.message || 'Lỗi thêm lớp học');
        });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lớp học này?')) {
      axios.delete(`/lop/${id}`)
        .then(() => fetchData())
        .catch(() => setError('Lỗi xóa lớp học'));
    }
  };

  if (loading) return <div className="class-list-page">Đang tải danh sách lớp học...</div>;
  if (error) return <div className="class-list-page" style={{color:'red'}}>{error}</div>;

  return (
    <div className="class-list-page">
      <h2>Danh sách lớp học</h2>
      <form className="class-form" onSubmit={handleSubmit}>
        <input name="MaLopHoc" value={form.MaLopHoc || ''} onChange={handleChange} placeholder="Mã lớp học" required />
        <input name="TenLop" value={form.TenLop || ''} onChange={handleChange} placeholder="Tên lớp" required />
        <input name="ChuyenNganh" value={form.ChuyenNganh || ''} onChange={handleChange} placeholder="Chuyên ngành" required />
        <input name="KhoaHoc" value={form.KhoaHoc || ''} onChange={handleChange} placeholder="Khóa học" required />
        <button type="submit">{editing ? 'Cập nhật' : 'Thêm mới'}</button>
        {editing && <button type="button" onClick={handleCancel}>Hủy</button>}
      </form>
      <table className="class-table">
        <thead>
          <tr>
            <th>Mã lớp học</th>
            <th>Tên lớp</th>
            <th>Chuyên ngành</th>
            <th>Khóa học</th>
            <th>Giáo viên chủ nhiệm</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {classes.map(item => (
            <tr key={item.MaLop}>
              <td>{item.MaLopHoc}</td>
              <td>{item.TenLop}</td>
              <td>{item.ChuyenNganh}</td>
              <td>{item.KhoaHoc}</td>
              <td>{item.TenGiaoVien || '-'}</td>
              <td>
                <button onClick={() => handleEdit(item)}>Sửa</button>
                <button onClick={() => handleDelete(item.MaLop)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClassList;
