import React, { useEffect, useState } from 'react';
import axios from '../../api/axiosConfig';
import { useUser } from '../../contexts/UserContext';
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
  const [classes, setClasses] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const { user } = useUser();

  const fetchData = () => {
    setLoading(true);
    axios.get('/cansu')
      .then(res => {
        // Lọc bỏ cán sự đã hết hạn (DenNgay < hôm nay)
        const today = new Date();
        const validCanSu = res.data.filter((item: any) => {
          if (!item.DenNgay) return true;
          return new Date(item.DenNgay) >= today;
        });
        // Xóa cán sự hết hạn khỏi DB
        const expired = res.data.filter((item: any) => item.DenNgay && new Date(item.DenNgay) < today);
        expired.forEach((item: any) => {
          axios.delete(`/cansu/${item.MaCanSu}`).catch(() => {});
        });
        setCanSu(validCanSu);
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
    openForm();
  };

  const handleCancel = () => {
    setEditing(null);
    setForm(emptyCanSu);
    setError(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Kiểm tra MaLop phải là số hợp lệ và có trong danh sách lớp
    const validLop = classes.find((lop: any) => String(lop.MaLop) === String(form.MaLop));
    if (!form.MaLop || !validLop) {
      setError('Vui lòng chọn lớp hợp lệ.');
      return;
    }
    if (!form.MaNguoiDung || !form.ChucVu || !form.TuNgay) {
      setError('Vui lòng nhập đầy đủ thông tin bắt buộc.');
      return;
    }
    // Ràng buộc DenNgay >= TuNgay
    if (form.DenNgay && form.TuNgay && new Date(form.DenNgay) < new Date(form.TuNgay)) {
      setError('Đến ngày không được nhỏ hơn từ ngày.');
      return;
    }
    setError(null);
    // Khi thêm mới, MaNguoiDung là ID người đang đăng nhập
    const submitData = {
      ...form,
      MaNguoiDung: editing ? form.MaNguoiDung : user?.userId
    };
    if (editing) {
      axios.put(`/cansu/${editing.MaCanSu}`, submitData)
        .then(() => {
          fetchData();
          setEditing(null);
          setForm(emptyCanSu);
          setShowForm(false);
        })
        .catch(() => setError('Lỗi cập nhật cán sự'));
    } else {
      axios.post('/cansu', submitData)
        .then(() => {
          fetchData();
          setForm(emptyCanSu);
          setShowForm(false);
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

  const openForm = (editItem?: any) => {
    setShowForm(true);
    axios.get('/lop/all')
      .then(res => setClasses(res.data))
      .catch(() => setClasses([]));
    axios.get('/user/all')
      .then(res => setUsers(res.data))
      .catch(() => setUsers([]));
  };

  if (loading) return <div className="cansu-list-page">Đang tải danh sách cán sự...</div>;
  if (error) return <div className="cansu-list-page" style={{color:'red'}}>{error}</div>;

  return (
    <div className="cansu-list-page">
      <h2>Danh sách cán sự</h2>
      {showForm && (
        <form className="cansu-form" onSubmit={handleSubmit}>
          <div>
            <label>Lớp:</label>
            <select
              name="MaLop"
              value={form.MaLop || ''}
              onChange={handleChange}
              required
              disabled={classes.length === 0}
            >
              <option value="">--Chọn lớp--</option>
              {classes.map((lop: any) => (
                <option key={lop.MaLop} value={lop.MaLop}>
                  {lop.TenLop}
                </option>
              ))}
            </select>
            {classes.length === 0 && (
              <div style={{ color: '#d32f2f', fontSize: 13, marginTop: 2 }}>
                Không có dữ liệu lớp. Vui lòng thêm lớp trước!
              </div>
            )}
          </div>
          {/* Chỉ cho sửa người giao khi edit, khi thêm mới sẽ tự động lấy user đăng nhập */}
          {editing && (
            <div>
              <label>Người giao:</label>
              <select
                name="MaNguoiDung"
                value={form.MaNguoiDung || ''}
                onChange={handleChange}
                required
              >
                <option value="">--Chọn người giao--</option>
                {users.map((u: any) => (
                  <option key={u.MaNguoiDung} value={u.MaNguoiDung}>
                    {u.HoTen}
                  </option>
                ))}
              </select>
            </div>
          )}
          <input
            name="ChucVu"
            value={form.ChucVu || ''}
            onChange={handleChange}
            placeholder="Chức vụ"
            required
          />
          <input
            name="TuNgay"
            type="date"
            value={form.TuNgay || ''}
            onChange={handleChange}
            required
          />
          <input
            name="DenNgay"
            type="date"
            value={form.DenNgay || ''}
            onChange={handleChange}
          />
          <button type="submit" className="action-btn" title={editing ? "Cập nhật" : "Thêm mới"}>
            <i className={editing ? "fas fa-save" : "fas fa-plus"}></i>
          </button>
          {editing && (
            <button
              type="button"
              className="action-btn delete"
              title="Hủy"
              onClick={handleCancel}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </form>
      )}
      <button className="action-btn" title="Thêm mới" onClick={() => openForm()}>
        <i className="fas fa-plus"></i>
      </button>
      <table className="cansu-table">
        <thead>
          <tr>
            <th>Người thêm </th>
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
                <button
                  className="action-btn"
                  title="Sửa"
                  onClick={() => handleEdit(item)}
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  className="action-btn delete"
                  title="Xóa"
                  onClick={() => handleDelete(item.MaCanSu)}
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CanSuList;
