import React, { useEffect, useState } from 'react';
import axios from '../../api/axiosConfig';
// import api from '../../utils/apiUtils'; // Nếu muốn dùng utils thì mở dòng này
import './ClassList.css';

interface ClassItem {
  MaLop: number;
  MaLopHoc: string;
  TenLop: string;
  ChuyenNganh: string;
  KhoaHoc: string;
  GiaoVien?: number;
  TenGiaoVien?: string;
}

const emptyClass: Partial<ClassItem> = {
  MaLopHoc: '',
  TenLop: '',
  ChuyenNganh: '',
  KhoaHoc: '',
  GiaoVien: undefined
};

function ClassList() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ClassItem | null>(null);
  const [form, setForm] = useState<Partial<ClassItem>>(emptyClass);
  const [teachers, setTeachers] = useState<{ id: number; name: string }[]>([]);

  // Lấy danh sách lớp học (luôn lấy cả TenGiaoVien nếu backend đã join)
  const fetchData = () => {
    setLoading(true);
    axios.get('/lop')
      .then(res => {
        // Debug dữ liệu trả về từ backend
        console.log('DATA /lop:', res.data);
        const data = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
        setClasses(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Không thể tải danh sách lớp học.');
        setLoading(false);
      });
  };

  // Lấy danh sách giáo viên (id, name)
  useEffect(() => {
    axios.get('/auth/users')
      .then(res => {
        // Lọc ra giáo viên (role === 'giangvien')
        setTeachers(
          res.data
            .filter((gv: any) => gv.VaiTro === 'giangvien')
            .map((gv: any) => ({
              id: gv.MaNguoiDung,
              name: gv.HoTen
            }))
        );
      })
      .catch(() => setTeachers([]));
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let updatedForm = { ...form, [name]: value };
    if (name === 'GiaoVien') {
      updatedForm.GiaoVien = value ? Number(value) : undefined;
    }
    setForm(updatedForm);
  };

  const handleEdit = (item: ClassItem) => {
    setEditing(item);
    setForm({
      MaLopHoc: item.MaLopHoc,
      TenLop: item.TenLop,
      ChuyenNganh: item.ChuyenNganh,
      KhoaHoc: item.KhoaHoc,
      GiaoVien: item.GiaoVien
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
    const submitData = {
      ...form,
      GiaoVien: form.GiaoVien ? Number(form.GiaoVien) : undefined
    };
    if (editing) {
      axios.put(`/lop/${editing.MaLop}`, submitData)
        .then(() => {
          fetchData();
          setEditing(null);
          setForm(emptyClass);
        })
        .catch(err => {
          setError(err.response?.data?.message || 'Lỗi cập nhật lớp học');
        });
    } else {
      axios.post('/lop', submitData)
        .then(() => {
          fetchData();
          setForm(emptyClass);
        })
        .catch(err => {
          setError(
            err.response?.data?.message ||
            (typeof err.response?.data === 'string' ? err.response.data : '') ||
            'Lỗi thêm lớp học'
          );
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
  if (error) return <div className="class-list-page" style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="class-list-page">
      <h2>Danh sách lớp học</h2>
      <form className="class-form" onSubmit={handleSubmit}>
        <input name="MaLopHoc" value={form.MaLopHoc || ''} onChange={handleChange} placeholder="Mã lớp học" required />
        <input name="TenLop" value={form.TenLop || ''} onChange={handleChange} placeholder="Tên lớp" required />
        <input name="ChuyenNganh" value={form.ChuyenNganh || ''} onChange={handleChange} placeholder="Chuyên ngành" required />
        <input name="KhoaHoc" value={form.KhoaHoc || ''} onChange={handleChange} placeholder="Khóa học" required />
        <select
          name="GiaoVien"
          value={form.GiaoVien !== undefined && form.GiaoVien !== null ? String(form.GiaoVien) : ''}
          onChange={handleChange}
          required
        >
          <option value="">-- Chọn giáo viên chủ nhiệm --</option>
          {teachers.map(gv => (
            <option key={gv.id} value={String(gv.id)}>
              {gv.id} - {gv.name}
            </option>
          ))}
        </select>
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
          {classes.length === 0 && (
            <tr>
              <td colSpan={6} style={{textAlign:'center', color:'#888'}}>Không có dữ liệu lớp học</td>
            </tr>
          )}
          {classes.map(item => (
            <tr key={item.MaLop}>
              <td>{item.MaLopHoc}</td>
              <td>{item.TenLop}</td>
              <td>{item.ChuyenNganh}</td>
              <td>{item.KhoaHoc}</td>
              <td>
                {('TenGiaoVien' in item && item.TenGiaoVien)
                  ? item.TenGiaoVien
                  : teachers.find(gv => String(gv.id) === String(item.GiaoVien))?.name || '-'}
              </td>
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
}

export default ClassList;
