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
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
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
    // Gọi API /cansu (đã lọc theo vai trò ở backend, dựa vào req.user)
    Promise.all([
      axios.get('/cansu'), // Không cần truyền user info, backend sẽ lấy từ req.user (middleware requireAuth)
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
            // Lọc chỉ những thành viên có role là sinhvien
            const sinhVienMembers = members.filter((u: any) => {
              const role = (
                u.VaiTro ||
                u.role ||
                u.vaitro ||
                u.Role ||
                u.ROLE ||
                ''
              ).toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
              return role === 'sinhvien';
            });
            setFilteredUsers(sinhVienMembers);
            // Nếu có user đầu tiên thì tự động chọn vào dropdown
            if (sinhVienMembers.length > 0) {
              setForm(prev => ({ ...prev, MaNguoiDung: sinhVienMembers[0].MaNguoiDung }));
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
        // Lọc chỉ những thành viên có role là sinhvien
        const sinhVienMembers = members.filter((u: any) => {
          const role = (
            u.VaiTro ||
            u.role ||
            u.vaitro ||
            u.Role ||
            u.ROLE ||
            ''
          ).toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
          return role === 'sinhvien';
        });
        setFilteredUsers(sinhVienMembers);
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

  // Thêm hàm tìm kiếm cán sự
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) {
      fetchData();
      return;
    }
    setSearching(true);
    setError(null);
    try {
      const res = await axios.get(`/cansu/search?q=${encodeURIComponent(search.trim())}`);
      let data: CanSu[] = [];
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data && typeof res.data === 'object') {
        data = [res.data];
      }
      setCanSu(data);
    } catch (err) {
      setError('Không tìm thấy cán sự phù hợp.');
      setCanSu([]);
    }
    setSearching(false);
  };

  // Lấy danh sách lớp của user hiện tại (nếu không phải admin)
  let userLopIds: number[] = [];
  if (userRole !== 'admin' && user) {
    // Ưu tiên các trường: MaLop, lopIds, dsLop, dsLopIds, userId
    if (Array.isArray((user as any).MaLop)) {
      userLopIds = (user as any).MaLop.map((id: any) => Number(id)).filter((id: any) => !isNaN(id));
    } else if (typeof (user as any).MaLop === 'number') {
      userLopIds = [(user as any).MaLop];
    } else if (typeof (user as any).MaLop === 'string' && (user as any).MaLop.trim() !== '') {
      userLopIds = (user as any).MaLop.split(',').map((id: string) => Number(id)).filter((id: any) => !isNaN(id));
    } else if (Array.isArray((user as any).lopIds)) {
      userLopIds = (user as any).lopIds.map((id: any) => Number(id)).filter((id: any) => !isNaN(id));
    } else if (Array.isArray((user as any).dsLop)) {
      userLopIds = (user as any).dsLop.map((id: any) => Number(id)).filter((id: any) => !isNaN(id));
    } else if (Array.isArray((user as any).dsLopIds)) {
      userLopIds = (user as any).dsLopIds.map((id: any) => Number(id)).filter((id: any) => !isNaN(id));
    }
    // Nếu vẫn không có, thử lấy từ MaLopHoc hoặc các trường khác nếu có
    // Nếu là sinh viên/cán sự, có thể chỉ có userId, cần map từ danh sách cán sự
    if (
      userLopIds.length === 0 &&
      (userRole === 'sinhvien' || userRole === 'cansu')
    ) {
      const userId = (user as any).userId || (user as any).MaNguoiDung;
      if (userId && cansu.length > 0) {
        // Lấy tất cả MaLop mà user này là thành viên (MaNguoiDung === userId)
        const lopIdsFromCanSu = cansu
          .filter(cs => cs.MaNguoiDung === userId)
          .map(cs => cs.MaLop);
        if (lopIdsFromCanSu.length > 0) {
          userLopIds = lopIdsFromCanSu;
        }
      }
    }
  }

  // Đảm bảo userLopIds cập nhật khi cansu thay đổi (dành cho sinh viên/cán sự)
  React.useEffect(() => {
    if (
      (userRole === 'sinhvien' || userRole === 'cansu') &&
      user &&
      userLopIds.length === 0
    ) {
      const userId = (user as any).userId || (user as any).MaNguoiDung;
      if (userId && cansu.length > 0) {
        const lopIdsFromCanSu = cansu
          .filter(cs => cs.MaNguoiDung === userId)
          .map(cs => cs.MaLop);
        if (lopIdsFromCanSu.length > 0) {
          
        }
      }
    }
  }, [cansu, user, userRole, userLopIds.length]);

  // Không filter lại theo userLopIds, chỉ dùng dữ liệu trả về từ backend
  const visibleCanSu: CanSu[] = cansu;

  // Thêm log để debug dữ liệu user, userRole, userLopIds, cansu, visibleCanSu
  console.log('user:', user);
  console.log('userRole:', userRole);
  console.log('userLopIds:', userLopIds);
  console.log('Tất cả cán sự:', cansu);
  console.log('Cán sự hiển thị:', visibleCanSu);

  if (loading) return <div className="cansu-list-page">Đang tải danh sách cán sự...</div>;
  if (error) return <div className="cansu-list-page" style={{color:'red'}}>{error}</div>;

  return (
    <div className="cansu-list-page" style={{ position: 'relative' }}>
      {/* Overlay mờ khi form mở */}
      {showForm && canEdit && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.18)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <form
            className="cansu-form"
            onSubmit={handleSubmit}
            style={{
              zIndex: 1001,
              minWidth: 340,
              maxWidth: 420,
              width: '96vw',
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 8px 32px #2563eb33',
              padding: 28,
              position: 'relative'
            }}
          >
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
                  <option disabled value="">Không có sinh viên trong lớp này</option>
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
        </div>
      )}
      {/* Làm mờ phần danh sách khi form mở */}
      <div style={showForm && canEdit ? { filter: 'blur(2px)', pointerEvents: 'none', userSelect: 'none' } : {}}>
        <h2>Danh sách cán sự</h2>
        {/* Thanh tìm kiếm cán sự */}
        <form
          onSubmit={handleSearch}
          style={{ display: 'flex', gap: 10, maxWidth: 400, margin: '0 auto 18px auto' }}
        >
          <input
            type="text"
            placeholder="Tìm kiếm theo tên cán sự hoặc tên lớp..."
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
                <th>Người được thêm</th>
                <th>Tên lớp</th>
                <th>Chức vụ</th>
                <th>Từ ngày</th>
                <th>Đến ngày</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {/* Đảm bảo dùng đúng biến visibleCanSu để render */}
              {visibleCanSu.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#888' }}>
                    Không có cán sự nào thuộc lớp của bạn.
                  </td>
                </tr>
              ) : (
                visibleCanSu.map(item => (
                  <tr key={item.MaCanSu}>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CanSuList;
