/**
 * StudentList: Manage student information.
 */
import React, { useEffect, useState } from 'react';
import axios from '../../api/axiosConfig';
import './StudentList.css';

/**
 * Student: Interface for student data.
 */
interface Student {
  MaNguoiDung: number;
  MaSoSV: string;
  HoTen: string;
  Email: string;
  SoDienThoai: string;
  VaiTro: string;
  TrangThai: boolean;
}

const emptyStudent: Partial<Student> = {
  MaSoSV: '',
  HoTen: '',
  Email: '',
  SoDienThoai: '',
  VaiTro: '',
  TrangThai: true
};

const StudentList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState<Partial<Student>>(emptyStudent);

  const fetchData = () => {
    setLoading(true);
    axios.get('/sinhvien')
      .then(res => {
        setStudents(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Không thể tải danh sách sinh viên.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (item: Student) => {
    setEditing(item);
    setForm(item);
  };

  const handleCancel = () => {
    setEditing(null);
    setForm(emptyStudent);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.MaSoSV || !form.HoTen || !form.Email || !form.VaiTro) {
      setError('Vui lòng nhập đầy đủ thông tin bắt buộc.');
      return;
    }
    setError(null);
    if (editing) {
      axios.put(`/sinhvien/${editing.MaNguoiDung}`, form)
        .then(() => {
          fetchData();
          setEditing(null);
          setForm(emptyStudent);
        })
        .catch(() => setError('Lỗi cập nhật sinh viên'));
    } else {
      axios.post('/sinhvien', form)
        .then(() => {
          fetchData();
          setForm(emptyStudent);
        })
        .catch(() => setError('Lỗi thêm sinh viên'));
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sinh viên này?')) {
      axios.delete(`/sinhvien/${id}`)
        .then(() => fetchData())
        .catch(() => setError('Lỗi xóa sinh viên'));
    }
  };

  if (loading) return <div className="student-list-page">Đang tải danh sách sinh viên...</div>;
  if (error) return <div className="student-list-page" style={{color:'red'}}>{error}</div>;

  return (
    <div className="student-list-page">
      <h2>Danh sách sinh viên</h2>
      <form className="student-form" onSubmit={handleSubmit}>
        <input name="MaSoSV" value={form.MaSoSV || ''} onChange={handleChange} placeholder="Mã số SV" required />
        <input name="HoTen" value={form.HoTen || ''} onChange={handleChange} placeholder="Họ tên" required />
        <input name="Email" value={form.Email || ''} onChange={handleChange} placeholder="Email" required />
        <input name="SoDienThoai" value={form.SoDienThoai || ''} onChange={handleChange} placeholder="SĐT" />
        <input name="VaiTro" value={form.VaiTro || ''} onChange={handleChange} placeholder="Vai trò" required />
        <select name="TrangThai" value={form.TrangThai ? '1' : '0'} onChange={e => setForm({ ...form, TrangThai: e.target.value === '1' })}>
          <option value="1">Hoạt động</option>
          <option value="0">Khóa</option>
        </select>
        <button type="submit">{editing ? 'Cập nhật' : 'Thêm mới'}</button>
        {editing && <button type="button" onClick={handleCancel}>Hủy</button>}
      </form>
      <table className="student-table">
        <thead>
          <tr>
            <th>MSSV</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>SĐT</th>
            <th>Vai trò</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {students.map(sv => (
            <tr key={sv.MaNguoiDung}>
              <td>{sv.MaSoSV}</td>
              <td>{sv.HoTen}</td>
              <td>{sv.Email}</td>
              <td>{sv.SoDienThoai}</td>
              <td>{sv.VaiTro}</td>
              <td>{sv.TrangThai ? 'Hoạt động' : 'Khóa'}</td>
              <td>
                <button onClick={() => handleEdit(sv)}>Sửa</button>
                <button onClick={() => handleDelete(sv.MaNguoiDung)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentList;
