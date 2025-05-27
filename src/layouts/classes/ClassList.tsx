/**
 * ClassList: Manage class information and assignments.
 */
import React, { useEffect, useState } from 'react';
import axios from '../../api/axiosConfig';
import { useUser } from '../../contexts/UserContext';
import './ClassList.css';

/**
 * ClassItem: Interface for class data.
 */
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

function ClassList() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ClassItem | null>(null);
  const [form, setForm] = useState<Partial<ClassItem>>(emptyClass);
  const [teachers, setTeachers] = useState<{ id: number; name: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const { user } = useUser();
  const userRole = getUserRole(user);
  // Chỉ admin và giảng viên được phép sửa/xóa/thêm
  const canEdit = userRole === 'admin' || userRole === 'giaovien';

  // Lấy danh sách lớp học (fix: luôn trả về mảng, không bị lỗi khi backend trả về object hoặc null)
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/lop');
      let data: ClassItem[] = [];
      // Đảm bảo luôn là mảng, không bị lỗi khi backend trả về object hoặc null
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data && typeof res.data === 'object') {
        // Nếu trả về 1 object đơn, ép thành mảng
        data = [res.data];
      }
      setClasses(data);
    } catch (err) {
      setError('Không thể tải danh sách lớp học.');
    }
    setLoading(false);
  };

  // Lấy danh sách giáo viên (id, name)
  useEffect(() => {
    axios.get('/auth/users')
      .then(res => {
        // Lọc ra giảng viên (role === 'giangvien')
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
    if (!canEdit) return;
    setEditing(item);
    setForm({
      MaLopHoc: item.MaLopHoc,
      TenLop: item.TenLop,
      ChuyenNganh: item.ChuyenNganh,
      KhoaHoc: item.KhoaHoc,
      GiaoVien: item.GiaoVien
    });
    setShowForm(true);
  };

  const handleAddNew = () => {
    if (!canEdit) return;
    setEditing(null);
    setForm(emptyClass);
    setError(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditing(null);
    setForm(emptyClass);
    setError(null);
    setShowForm(false);
  };

  // Khi thêm mới lớp học, sau khi thêm thành công thì fetch lại danh sách lớp học
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      setError('Bạn không có quyền thực hiện thao tác này.');
      return;
    }
    if (!form.MaLopHoc || !form.TenLop || !form.ChuyenNganh || !form.KhoaHoc || !form.GiaoVien) {
      setError('Vui lòng nhập đầy đủ thông tin bắt buộc.');
      return;
    }
    setError(null);
    const submitData = {
      MaLopHoc: form.MaLopHoc,
      TenLop: form.TenLop,
      ChuyenNganh: form.ChuyenNganh,
      KhoaHoc: form.KhoaHoc,
      GiaoVien: Number(form.GiaoVien)
    };
    try {
      if (editing) {
        await axios.put(`/lop/${editing.MaLop}`, submitData);
        setEditing(null);
      } else {
        await axios.post('/lop', submitData);
      }
      await fetchData();
      setForm(emptyClass);
      setShowForm(false);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : '') ||
        'Lỗi thêm/cập nhật lớp học'
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (!canEdit) {
      setError('Bạn không có quyền xóa lớp.');
      return;
    }
    if (!id) {
      setError('Không xác định được lớp để xóa.');
      return;
    }
    if (window.confirm('Bạn có chắc chắn muốn xóa lớp học này?')) {
      setError(null);
      try {
        // Một số backend yêu cầu gửi đúng kiểu số, thử ép kiểu id về số
        await axios.delete(`/lop/${Number(id)}`);
        // Nếu backend yêu cầu truyền id qua params khác, ví dụ: await axios.delete('/lop', { params: { id } });
        await fetchData();
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
          (typeof err.response?.data === 'string' ? err.response.data : '') ||
          'Lỗi xóa lớp học'
        );
      }
    }
  };

  // Xem thành viên lớp
  const handleViewMembers = async (lop: ClassItem) => {
    setSelectedClass(lop);
    setShowMembersModal(true);
    setLoadingMembers(true);
    try {
      // Sửa lại endpoint, bỏ bớt '/api' nếu axios đã cấu hình baseURL là /api
      const res = await axios.get(`/lop/${lop.MaLop}/thanhvien`);
      let data = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
      data = data.filter((m: any) => m && m.MaNguoiDung);
      // Thêm log để debug
      console.log('Thành viên lớp:', data);
      setMembers(data);
    } catch {
      setMembers([]);
    }
    setLoadingMembers(false);
  };

  if (loading) return <div className="class-list-page">Đang tải danh sách lớp học...</div>;
  if (error) return <div className="class-list-page" style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="class-list-page">
      <h2>Danh sách lớp học</h2>
      {error && <div className="form-error" style={{ marginBottom: 8 }}>{error}</div>}
      {showForm && canEdit && (
        <form className="class-form" onSubmit={handleSubmit}>
          <h3 className="class-form-title">
            {editing ? 'Cập nhật lớp học' : 'Thêm lớp học mới'}
          </h3>
          <div className="class-form-group">
            <input
              name="MaLopHoc"
              value={form.MaLopHoc || ''}
              onChange={handleChange}
              placeholder="Mã lớp học"
              required
              autoFocus
            />
          </div>
          <div className="class-form-group">
            <input
              name="TenLop"
              value={form.TenLop || ''}
              onChange={handleChange}
              placeholder="Tên lớp"
              required
            />
          </div>
          <div className="class-form-group">
            <input
              name="ChuyenNganh"
              value={form.ChuyenNganh || ''}
              onChange={handleChange}
              placeholder="Chuyên ngành"
              required
            />
          </div>
          <div className="class-form-group">
            <input
              name="KhoaHoc"
              value={form.KhoaHoc || ''}
              onChange={handleChange}
              placeholder="Khóa học"
              required
            />
          </div>
          <div className="class-form-group">
            <select
              name="GiaoVien"
              value={form.GiaoVien !== undefined && form.GiaoVien !== null ? String(form.GiaoVien) : ''}
              onChange={handleChange}
              required
            >
              <option value="">-- Chọn giáo viên chủ nhiệm --</option>
              {teachers.length === 0
                ? <option value="" disabled>Không có giáo viên</option>
                : teachers.map(gv => (
                    <option key={gv.id} value={String(gv.id)}>
                      {gv.id} - {gv.name}
                    </option>
                  ))
              }
            </select>
          </div>
          {error && <div className="form-error" style={{ marginBottom: 8 }}>{error}</div>}
          <div className="class-form-actions">
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
          onClick={handleAddNew}
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
          <i className="fas fa-plus"></i> Thêm lớp mới
        </button>
      )}
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          boxShadow: "0 4px 24px #2563eb18",
          overflow: "hidden",
          marginTop: 18,
          marginBottom: 32,
          border: "1.5px solid #e0e7ef"
        }}
      >
        <table className="class-table" style={{ margin: 0 }}>
          <thead>
            <tr>
              <th style={{ width: 110 }}>Mã lớp học</th>
              <th style={{ width: 180 }}>Tên lớp</th>
              <th style={{ width: 160 }}>Chuyên ngành</th>
              <th style={{ width: 110 }}>Khóa học</th>
              <th style={{ width: 180 }}>Giáo viên chủ nhiệm</th>
              <th style={{ width: 160, textAlign: "center" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {classes.length === 0 && (
              <tr>
                <td colSpan={6} style={{textAlign:'center', color:'#888'}}>Không có dữ liệu lớp học</td>
              </tr>
            )}
            {classes.map((item, idx) => (
              <tr
                key={item.MaLop}
                style={{
                  background: idx % 2 === 0 ? "#f9fafe" : "#fff",
                  transition: "background 0.18s"
                }}
              >
                <td style={{ fontWeight: 600, color: "#2563eb" }}>{item.MaLopHoc}</td>
                <td style={{ fontWeight: 500 }}>{item.TenLop}</td>
                <td>{item.ChuyenNganh}</td>
                <td>{item.KhoaHoc}</td>
                <td>
                  {('TenGiaoVien' in item && item.TenGiaoVien)
                    ? item.TenGiaoVien
                    : teachers.find(gv => String(gv.id) === String(item.GiaoVien))?.name || '-'}
                </td>
                <td style={{ textAlign: "center" }}>
                  {canEdit && (
                    <>
                      <button
                        className="action-btn"
                        title="Sửa"
                        onClick={() => handleEdit(item)}
                        style={{
                          marginRight: 6,
                          background: "#e0e7ef",
                          color: "#2563eb",
                          borderRadius: 6,
                          border: "none"
                        }}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="action-btn delete"
                        title="Xóa"
                        onClick={() => handleDelete(item.MaLop)}
                        style={{
                          marginRight: 6,
                          background: "#fdeaea",
                          color: "#d32f2f",
                          borderRadius: 6,
                          border: "none"
                        }}
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </>
                  )}
                  <button
                    className="action-btn"
                    title="Xem thành viên"
                    style={{
                      marginLeft: 2,
                      background: "#f1f5f9",
                      color: "#2563eb",
                      borderRadius: 6,
                      border: "none"
                    }}
                    onClick={() => handleViewMembers(item)}
                  >
                    <i className="fas fa-users"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal xem thành viên lớp */}
      {showMembersModal && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.2)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          onClick={() => setShowMembersModal(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 18,
              boxShadow: '0 12px 48px #8885',
              padding: 40,
              minWidth: 520,
              maxWidth: 900,
              width: '90vw',
              position: 'relative',
              border: '2px solid #e0e7ef'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              className="action-btn delete"
              style={{
                position: 'absolute', top: 18, right: 18,
                fontSize: 22, background: '#fdeaea', color: '#d32f2f'
              }}
              onClick={() => setShowMembersModal(false)}
              title="Đóng"
            >
              <i className="fas fa-times"></i>
            </button>
            <h3 style={{
              marginBottom: 22,
              color: '#2563eb',
              fontWeight: 700,
              fontSize: '1.25rem',
              textAlign: 'center'
            }}>
              Thành viên lớp: {selectedClass?.TenLop}
            </h3>
            {loadingMembers ? (
              <div style={{ color: '#888', textAlign: 'center', padding: 32, fontSize: 18 }}>Đang tải thành viên...</div>
            ) : (!members || members.length === 0) ? (
              <div style={{ color: '#888', textAlign: 'center', padding: 32, fontSize: 18 }}>Không có thành viên.</div>
            ) : (
              <div style={{
                maxHeight: 480,
                overflowY: 'auto',
                borderRadius: 10,
                border: '1.5px solid #e0e7ef',
                background: '#f9fafe',
                boxShadow: '0 2px 12px #e0e7ef55',
                marginBottom: 0
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  background: 'transparent',
                  fontSize: 17
                }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: 10 }}>Mã SV</th>
                      <th style={{ textAlign: 'left', padding: 10 }}>Họ tên</th>
                      <th style={{ textAlign: 'left', padding: 10 }}>Vai trò</th>
                      <th style={{ textAlign: 'left', padding: 10 }}>Email</th>
                      <th style={{ textAlign: 'left', padding: 10 }}>SĐT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m: any) => (
                      <tr key={m.MaNguoiDung}>
                        <td style={{ padding: 10 }}>{m.MaSoSV || m.MaNguoiDung}</td>
                        <td style={{ padding: 10 }}>{m.HoTen || ''}</td>
                        <td style={{ padding: 10 }}>{m.VaiTro || ''}</td>
                        <td style={{ padding: 10 }}>{m.Email || ''}</td>
                        <td style={{ padding: 10 }}>{m.SoDienThoai || ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ClassList;
