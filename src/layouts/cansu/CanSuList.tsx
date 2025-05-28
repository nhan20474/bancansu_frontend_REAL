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
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const { user } = useUser();

  // Phân quyền: chỉ admin và giảng viên được thêm/sửa/xóa, còn lại chỉ xem
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
  const canEdit = userRole === 'admin' || userRole === 'giangvien';

  const fetchData = () => {
    setLoading(true);
    // Lấy cả danh sách cán sự và user song song
    Promise.all([
      axios.get('/cansu'),
      axios.get('/user/all')
    ])
      .then(([cansuRes, userRes]) => {
        // Lọc bỏ cán sự đã hết hạn (DenNgay < hôm nay)
        const today = new Date();
        const validCanSu = cansuRes.data.filter((item: any) => {
          if (!item.DenNgay) return true;
          return new Date(item.DenNgay) >= today;
        });
        // Xóa cán sự hết hạn khỏi DB
        const expired = cansuRes.data.filter((item: any) => item.DenNgay && new Date(item.DenNgay) < today);
        expired.forEach((item: any) => {
          axios.delete(`/cansu/${item.MaCanSu}`).catch(() => {});
        });
        setUsers(userRes.data);
        // Map tên người được thêm vào từng cán sự (dựa vào MaNguoiDung)
        const userMap: Record<number, string> = {};
        userRes.data.forEach((u: any) => {
          userMap[u.MaNguoiDung] = u.HoTen || u.email || u.MaNguoiDung;
        });
        const canSuWithTen = validCanSu.map((item: any) => ({
          ...item,
          TenCanSu: userMap[item.MaNguoiDung] || ''
        }));
        setCanSu(canSuWithTen);
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
    const { name, value } = e.target;
    if (name === 'MaLop') {
      setForm(prev => ({ ...prev, MaLop: Number(value), MaNguoiDung: 0 }));
      // Lấy thành viên lớp từ API thay vì lọc users toàn trường
      if (value) {
        axios.get(`/lop/${value}/thanhvien`)
          .then(res => {
            const members = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
            setFilteredUsers(members);
            // Nếu có user đầu tiên thì tự động chọn vào dropdown
            if (members.length > 0) {
              setForm(prev => ({ ...prev, MaNguoiDung: members[0].MaNguoiDung }));
            } else {
              setForm(prev => ({ ...prev, MaNguoiDung: 0 }));
            }
          })
          .catch(() => {
            setFilteredUsers([]);
            setForm(prev => ({ ...prev, MaNguoiDung: 0 }));
          });
      } else {
        setFilteredUsers([]);
        setForm(prev => ({ ...prev, MaNguoiDung: 0 }));
      }
    } else if (name === 'MaNguoiDung') {
      setForm(prev => ({ ...prev, MaNguoiDung: Number(value) }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEdit = (item: CanSu) => {
    if (!canEdit) return;
    setEditing(item);
    setShowForm(true);
    setForm({
      MaLop: item.MaLop,
      MaNguoiDung: item.MaNguoiDung,
      ChucVu: item.ChucVu,
      TuNgay: item.TuNgay ? item.TuNgay.slice(0, 10) : '',
      DenNgay: item.DenNgay ? item.DenNgay.slice(0, 10) : ''
    });
    // Lấy lại danh sách lớp trước khi lấy thành viên lớp
    axios.get('/lop/all')
      .then(res => {
        setClasses(res.data);
        // Sau khi có danh sách lớp, lấy thành viên lớp
        return axios.get(`/lop/${item.MaLop}/thanhvien`);
      })
      .then(res => {
        const members = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
        setFilteredUsers(members);
      })
      .catch(() => {
        setClasses([]);
        setFilteredUsers([]);
      });
  };

  const handleCancel = () => {
    setEditing(null);
    setForm(emptyCanSu);
    setError(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      setError('Bạn không có quyền thực hiện thao tác này.');
      return;
    }
    // Kiểm tra MaLop phải là số hợp lệ và có trong danh sách lớp
    const validLop = classes.find((lop: any) => String(lop.MaLop) === String(form.MaLop));
    if (!form.MaLop || !validLop) {
      setError('Vui lòng chọn lớp hợp lệ.');
      return;
    }
    // Bắt buộc phải chọn người được thêm (MaNguoiDung)
    if (!form.MaNguoiDung || !form.ChucVu || !form.TuNgay) {
      setError('Vui lòng nhập đầy đủ thông tin bắt buộc.');
      return;
    }
    // Kiểm tra người được thêm có thực sự là thành viên của lớp không (dựa vào filteredUsers)
    const isMember = filteredUsers.some(
      (u: any) => String(u.MaNguoiDung) === String(form.MaNguoiDung)
    );
    if (!isMember) {
      setError('Người được thêm không thuộc lớp đã chọn.');
      return;
    }
    // Ràng buộc DenNgay >= TuNgay (nếu có DenNgay)
    if (form.DenNgay && form.TuNgay && new Date(form.DenNgay) < new Date(form.TuNgay)) {
      setError('Đến ngày không được nhỏ hơn từ ngày.');
      return;
    }
    setError(null);
    // MaNguoiDung là người được thêm (chọn từ dropdown)
    const submitData = {
      ...form,
      DenNgay: form.DenNgay ? form.DenNgay : null
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
    if (!canEdit) {
      setError('Bạn không có quyền xóa cán sự.');
      return;
    }
    if (window.confirm('Bạn có chắc chắn muốn xóa cán sự này?')) {
      axios.delete(`/cansu/${id}`)
        .then(() => fetchData())
        .catch(() => setError('Lỗi xóa cán sự'));
    }
  };

  const openForm = (editItem?: any) => {
    if (!canEdit) return;
    setShowForm(true);
    axios.get('/lop/all')
      .then(res => setClasses(res.data))
      .catch(() => setClasses([]));
    setFilteredUsers([]);
    setForm(prev => ({ ...prev, MaNguoiDung: 0 }));
  };

  if (loading) return <div className="cansu-list-page">Đang tải danh sách cán sự...</div>;
  if (error) return <div className="cansu-list-page" style={{color:'red'}}>{error}</div>;

  return (
    <div className="cansu-list-page">
      <h2>Danh sách cán sự</h2>
      {showForm && canEdit && (
        <form className="cansu-form" onSubmit={handleSubmit}>
          <h3 className="cansu-form-title">
            {editing ? 'Cập nhật cán sự' : 'Thêm cán sự mới'}
          </h3>
          <div className="cansu-form-group">
            <select
              name="MaLop"
              value={form.MaLop || ''}
              onChange={handleChange}
              required
              disabled={!!editing || classes.length === 0}
            >
              <option value="">--Chọn lớp--</option>
              {classes.map((lop: any) => (
                <option key={lop.MaLop} value={lop.MaLop}>
                  {lop.TenLop}
                </option>
              ))}
            </select>
            {classes.length === 0 && (
              <div className="form-error" style={{ fontSize: 13, marginTop: 2 }}>
                Không có dữ liệu lớp. Vui lòng thêm lớp trước!
              </div>
            )}
          </div>
          <div className="cansu-form-group">
            <select
              name="MaNguoiDung"
              value={form.MaNguoiDung || ''}
              onChange={handleChange}
              required
              disabled={!!editing || !form.MaLop}
            >
              <option value="">--Chọn người--</option>
              {form.MaLop && filteredUsers.length === 0 && (
                <option disabled value="">Không có thành viên trong lớp này</option>
              )}
              {filteredUsers.map((u: any) => (
                <option key={u.MaNguoiDung} value={u.MaNguoiDung}>
                  {u.HoTen || u.email || u.MaNguoiDung}
                </option>
              ))}
            </select>
          </div>
          <div className="cansu-form-group">
            <input
              name="ChucVu"
              value={form.ChucVu || ''}
              onChange={handleChange}
              placeholder="Chức vụ"
              required
            />
          </div>
          <div className="cansu-form-row">
            <input
              name="TuNgay"
              type="date"
              value={form.TuNgay || ''}
              onChange={handleChange}
              required
              style={{ flex: 1 }}
              placeholder="Từ ngày"
            />
            <input
              name="DenNgay"
              type="date"
              value={form.DenNgay || ''}
              onChange={handleChange}
              style={{ flex: 1 }}
              placeholder="Đến ngày"
            />
          </div>
          {error && <div className="form-error" style={{ marginBottom: 8 }}>{error}</div>}
          <div className="cansu-form-actions">
            <button type="submit" className="action-btn">
              <i className={editing ? "fas fa-save" : "fas fa-plus"}></i> {editing ? "Lưu cập nhật" : "Thêm mới"}
            </button>
            <button
              type="button"
              className="action-btn delete"
              title="Hủy"
              onClick={handleCancel}
            >
              <i className="fas fa-times"></i> Hủy
            </button>
          </div>
        </form>
      )}
      {canEdit && (
        <button
          className="action-btn"
          title="Thêm mới"
          onClick={() => openForm()}
          style={{
            marginBottom: 18,
            background: "#2563eb",
            color: "#fff",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: "1rem",
            padding: "8px 18px",
            boxShadow: "0 2px 8px #2563eb22",
            border: "none"
          }}
        >
          <i className="fas fa-plus"></i> Thêm cán sự mới
        </button>
      )}
      <div className="table-wrapper">
        <table className="cansu-table">
          <thead>
            <tr>
              <th>Người thêm</th>
              <th>Người được thêm</th>
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
                <td>{item.TenCanSu || ''}</td>
                <td>{item.TenLop || ''}</td>
                <td>{item.ChucVu}</td>
                <td>{item.TuNgay ? new Date(item.TuNgay).toLocaleDateString() : ''}</td>
                <td>{item.DenNgay ? new Date(item.DenNgay).toLocaleDateString() : ''}</td>
                <td>
                  {canEdit && (
                    <>
                      <button
                        className="action-btn"
                        title="Sửa"
                        style={{
                          background: "#e0e7ef",
                          color: "#2563eb",
                          borderRadius: 6,
                          border: "none",
                          marginRight: 6,
                          padding: "6px 10px",
                          fontSize: "1.1rem"
                        }}
                        onClick={() => handleEdit(item)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="action-btn delete"
                        title="Xóa"
                        style={{
                          background: "#fdeaea",
                          color: "#d32f2f",
                          borderRadius: 6,
                          border: "none",
                          marginRight: 6,
                          padding: "6px 10px",
                          fontSize: "1.1rem"
                        }}
                        onClick={() => handleDelete(item.MaCanSu)}
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CanSuList;
