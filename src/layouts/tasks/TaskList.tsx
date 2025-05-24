/**
 * TaskList: Manage and display tasks for classes.
 */
import React, { useEffect, useState } from 'react';
import axios from '../../api/axiosConfig';
import './TaskList.css';
import { Link } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

/**
 * Task: Interface for task data.
 */
interface Task {
  MaNhiemVu: number;
  TieuDe: string;
  MoTa: string;
  HanHoanThanh: string;
  DoUuTien: string;
  TepDinhKem: string | null;
  NgayTao: string;
  MaLop: number;
  TenLop: string;
  NguoiGiao: number;
  TenNguoiGiao?: string; // Thêm trường này để lấy tên người giao nếu backend trả về
}

interface Lop {
  MaLop: number;
  TenLop: string;
}

const emptyForm: Partial<Task> = {
  TieuDe: '',
  MoTa: '',
  HanHoanThanh: '',
  DoUuTien: '',
  MaLop: 1,
};

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Task>>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [taskDetail, setTaskDetail] = useState<any>(null);
  const { user } = useUser();
  const [classes, setClasses] = useState<Lop[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await axios.get('/nhiemvu'); // Đúng endpoint
      if (!Array.isArray(res.data)) {
        setError('Dữ liệu nhiệm vụ không hợp lệ từ server.');
        setTasks([]);
      } else {
        setTasks(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách nhiệm vụ. Vui lòng thử lại sau.');
      setTasks([]);
    }
    setLoading(false);
  };

  // Lấy danh sách lớp
  const fetchClasses = async () => {
    try {
      const res = await axios.get('/lop');
      setClasses(Array.isArray(res.data) ? res.data : []);
    } catch {
      setClasses([]);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchClasses();
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleFormSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    if (!form.TieuDe || !form.HanHoanThanh || !form.DoUuTien || !form.MaLop) {
      setFormError('❌ Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }

    // Thêm mới nhiệm vụ (không dùng editId)
    if (editId === null) {
      try {
        if (file) {
          const formData = new FormData();
          formData.append('TieuDe', form.TieuDe || '');
          formData.append('MoTa', form.MoTa || '');
          formData.append('HanHoanThanh', form.HanHoanThanh || '');
          formData.append('DoUuTien', form.DoUuTien || '');
          formData.append('MaLop', String(form.MaLop || ''));
          formData.append('NguoiGiao', String(user?.userId || ''));
          formData.append('TepDinhKem', file);

          await axios.post('/nhiemvu', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } else {
          const jsonData = {
            TieuDe: form.TieuDe,
            MoTa: form.MoTa,
            HanHoanThanh: form.HanHoanThanh,
            DoUuTien: form.DoUuTien,
            MaLop: form.MaLop,
            NguoiGiao: user?.userId || ''
          };
          await axios.post('/nhiemvu', jsonData, {
            headers: { 'Content-Type': 'application/json' }
          });
        }
        setSuccessMsg('✅ Thêm nhiệm vụ mới thành công!');
        setForm(emptyForm);
        setFile(null);
        setEditId(null);
        await fetchTasks();
        setShowForm(false);
      } catch (error: any) {
        setFormError(
          error?.response?.data?.message ||
          (typeof error?.response?.data === 'string' ? error.response.data : '') ||
          '❌ Đã xảy ra lỗi khi gửi dữ liệu. Vui lòng thử lại!'
        );
      }
      return;
    }

    // Sửa nhiệm vụ (editId khác null)
    try {
      if (file) {
        const formData = new FormData();
        formData.append('TieuDe', form.TieuDe || '');
        formData.append('MoTa', form.MoTa || '');
        formData.append('HanHoanThanh', form.HanHoanThanh || '');
        formData.append('DoUuTien', form.DoUuTien || '');
        formData.append('MaLop', String(form.MaLop || ''));
        formData.append('NguoiGiao', String(user?.userId || ''));
        formData.append('TepDinhKem', file);

        await axios.put(`/nhiemvu/${editId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        const jsonData = {
          TieuDe: form.TieuDe,
          MoTa: form.MoTa,
          HanHoanThanh: form.HanHoanThanh,
          DoUuTien: form.DoUuTien,
          MaLop: form.MaLop,
          NguoiGiao: user?.userId || ''
        };
        await axios.put(`/nhiemvu/${editId}`, jsonData, {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      setSuccessMsg('✅ Cập nhật nhiệm vụ thành công!');
      setForm(emptyForm);
      setFile(null);
      setEditId(null);
      await fetchTasks();
      setShowForm(false);
    } catch (error: any) {
      setFormError(
        error?.response?.data?.message ||
        (typeof error?.response?.data === 'string' ? error.response.data : '') ||
        '❌ Đã xảy ra lỗi khi gửi dữ liệu. Vui lòng thử lại!'
      );
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setForm(emptyForm);
    setFile(null);
    setEditId(null);
    setFormError(null);
    setSuccessMsg(null);
  };

  // Hàm lấy chi tiết nhiệm vụ từ API
  const fetchTaskDetail = async (maNhiemVu: number) => {
    setDetailLoading(true);
    setDetailError(null);
    setTaskDetail(null);
    try {
      // Sử dụng endpoint mới để lấy chi tiết nhiệm vụ (bao gồm nộp bài)
      const res = await axios.get(`/nhiemvu/${maNhiemVu}/chitiet`);
      setTaskDetail(res.data);
    } catch (err: any) {
      setDetailError(err.response?.data?.message || 'Không thể tải chi tiết nhiệm vụ.');
    }
    setDetailLoading(false);
  };

  // Thêm/sửa nhiệm vụ: dùng chung form, đồng bộ state khi sửa hoặc thêm mới
  const openForm = (task?: Task | null) => {
    setShowForm(true);
    setFormError(null);
    setSuccessMsg(null);
    setFile(null);
    if (task) {
      // Sửa nhiệm vụ
      setEditId(task.MaNhiemVu);
      setForm({
        TieuDe: task.TieuDe,
        MoTa: task.MoTa,
        HanHoanThanh: task.HanHoanThanh?.slice(0, 10),
        DoUuTien: task.DoUuTien,
        MaLop: task.MaLop,
        TepDinhKem: null
      });
    } else {
      // Thêm mới nhiệm vụ
      setEditId(null);
      setForm(emptyForm);
    }
  };

  // Xử lý sửa nhiệm vụ
  const handleEdit = (task: Task) => {
    openForm(task);
  };

  // Xử lý xóa nhiệm vụ (không reset form thêm/sửa)
  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa nhiệm vụ này?')) return;
    try {
      await axios.delete(`/nhiemvu/${id}`);
      setSuccessMsg('✅ Đã xóa nhiệm vụ!');
      await fetchTasks();
      // Không reset form, không ảnh hưởng đến form thêm/sửa đang mở
    } catch (err: any) {
      setFormError(
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : '') ||
        'Không thể xóa nhiệm vụ. Vui lòng thử lại.'
      );
    }
  };

  // Thông báo đang tải
  if (loading) return (
    <div className="task-list-page">
      <div className="form-success">Đang tải danh sách nhiệm vụ...</div>
    </div>
  );

  // Thông báo lỗi chung
  if (error) return (
    <div className="task-list-page">
      <div className="form-error">{error}</div>
      <button className="action-btn" onClick={fetchTasks}>Thử lại</button>
    </div>
  );

  // Dữ liệu không hợp lệ
  if (!Array.isArray(tasks)) {
    return (
      <div className="task-list-page">
        <div className="form-error">
          Dữ liệu nhiệm vụ không hợp lệ: {JSON.stringify(tasks)}
        </div>
        <button className="action-btn" onClick={fetchTasks}>Thử lại</button>
      </div>
    );
  }

  // --- BẮT ĐẦU PHẦN DANH SÁCH NHIỆM VỤ ---
  return (
    <div className="task-list-page" style={{ height: '100vh', overflowY: 'auto' }}>
      <div style={{ marginBottom: 16 }}>
        
        
      </div>
      <h2>Danh sách nhiệm vụ</h2>
      {successMsg && <div className="form-success">{successMsg}</div>}
      <button className="action-btn" onClick={() => openForm(null)}>
        <i className="fas fa-plus"></i> Thêm nhiệm vụ mới
      </button>
      {showForm && (
        <form className="task-form" onSubmit={handleFormSubmit}>
          <h3 className="task-form-title">
            {editId ? 'Cập nhật nhiệm vụ' : 'Thêm nhiệm vụ mới'}
          </h3>
          <div className="task-form-group">
            <input
              name="TieuDe"
              value={form.TieuDe || ''}
              onChange={handleFormChange}
              placeholder="Tên nhiệm vụ"
              required
              autoFocus
            />
          </div>
          <div className="task-form-group">
            <textarea
              name="MoTa"
              value={form.MoTa || ''}
              onChange={handleFormChange}
              placeholder="Mô tả nhiệm vụ"
              rows={3}
              required
              style={{ resize: 'vertical', minHeight: 60 }}
            />
          </div>
          <div className="task-form-row">
            <input
              name="HanHoanThanh"
              type="date"
              value={form.HanHoanThanh?.slice(0, 10) || ''}
              onChange={handleFormChange}
              required
              placeholder="Hạn hoàn thành"
            />
            <select
              name="DoUuTien"
              value={form.DoUuTien || ''}
              onChange={handleFormChange}
              required
            >
              <option value="">Chọn độ ưu tiên</option>
              <option value="Cao">Cao</option>
              <option value="Trung bình">Trung bình</option>
              <option value="Thấp">Thấp</option>
            </select>
          </div>
          <div className="task-form-group">
            <select
              name="MaLop"
              value={form.MaLop || ''}
              onChange={handleFormChange}
              required
            >
              <option value="">--Chọn lớp--</option>
              {classes.map(lop => (
                <option key={lop.MaLop} value={lop.MaLop}>
                  {lop.TenLop}
                </option>
              ))}
            </select>
          </div>
          <div className="task-form-group">
            <input
              type="file"
              name="TepDinhKem"
              accept="*"
              onChange={handleFileChange}
              style={{ marginTop: 4 }}
            />
          </div>
          {formError && <div className="form-error" style={{ marginBottom: 8 }}>{formError}</div>}
          <div className="task-form-actions">
            <button type="submit" className="action-btn">
              <i className={editId ? "fas fa-save" : "fas fa-save"}></i> {editId ? "Lưu cập nhật" : "Lưu"}
            </button>
            <button type="button" className="action-btn delete" onClick={handleCancel}>Hủy</button>
          </div>
        </form>
      )}
      <div className="task-table-wrap">
        <h3 style={{ margin: '16px 0 8px 0' }}>Danh sách nhiệm vụ</h3>
        <table className="task-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên nhiệm vụ</th>
              <th>Mô tả</th>
              <th>Hạn hoàn thành</th>
              <th>Mức độ ưu tiên</th>
              <th>Tên lớp</th>
              <th>Ngày tạo</th>
              <th>Tệp đính kèm</th>
              <th>Người giao</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', color: '#888' }}>
                  <div className="form-error" style={{margin: 0}}>Không có nhiệm vụ nào.</div>
                </td>
              </tr>
            ) : (
              tasks.map((task, idx) => (
                <tr key={task.MaNhiemVu}>
                  <td>{idx + 1}</td>
                  <td>{task.TieuDe}</td>
                  <td style={{maxWidth:180, whiteSpace:'pre-line', overflow:'hidden', textOverflow:'ellipsis'}}>{task.MoTa}</td>
                  <td>{task.HanHoanThanh ? new Date(task.HanHoanThanh).toLocaleDateString('vi-VN') : ''}</td>
                  <td>
                    <span style={{
                      color: task.DoUuTien === 'Cao' ? '#d32f2f' : (task.DoUuTien === 'Trung bình' ? '#f59e42' : '#2563eb'),
                      fontWeight: 600
                    }}>
                      {task.DoUuTien}
                    </span>
                  </td>
                  <td>{task.TenLop}</td>
                  <td>{task.NgayTao ? new Date(task.NgayTao).toLocaleDateString('vi-VN') : ''}</td>
                  <td>
                    {task.TepDinhKem
                      ? (
                        <a
                          href={task.TepDinhKem.startsWith('http') ? task.TepDinhKem : `http://localhost:8080/uploads/${task.TepDinhKem.replace(/^(App[\\/])?(uploads[\\/])?/i, '').replace(/^[/\\]+/, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#2563eb', textDecoration: 'underline', fontSize: 15 }}
                        >
                          Xem file
                        </a>
                      )
                      : <span style={{ color: '#888' }}>Không có</span>
                    }
                  </td>
                  <td>
                    {task.TenNguoiGiao || ''}
                  </td>
                  <td>
                    <button
                      className="action-btn"
                      onClick={() => {
                        setSelectedTask(task);
                        fetchTaskDetail(task.MaNhiemVu);
                      }}
                      title="Xem chi tiết nhiệm vụ"
                    >
                      <i className="fas fa-eye"></i> Xem
                    </button>
                    <button
                      className="action-btn"
                      title="Sửa"
                      onClick={() => openForm(task)}
                      style={{ marginLeft: 4 }}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="action-btn delete"
                      title="Xóa"
                      onClick={() => handleDelete(task.MaNhiemVu)}
                      style={{ marginLeft: 4 }}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Modal chi tiết nhiệm vụ */}
      {selectedTask && (
        <div
          className="task-detail-modal"
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.25)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'auto' // <-- enable scroll for modal background
          }}
          onClick={() => {
            setSelectedTask(null);
            setTaskDetail(null);
            setDetailError(null);
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 10,
              boxShadow: '0 4px 24px #8884',
              padding: 32,
              minWidth: 340,
              maxWidth: 1200,
              width: '98vw',
              position: 'relative',
              overflowX: 'auto',
              maxHeight: '90vh', // <-- limit modal height
              overflowY: 'auto'  // <-- enable scroll for modal content
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              className="action-btn delete"
              style={{ position: 'absolute', top: 10, right: 10 }}
              onClick={() => {
                setSelectedTask(null);
                setTaskDetail(null);
                setDetailError(null);
              }}
              title="Đóng"
            >
              <i className="fas fa-times"></i>
            </button>
            <h3 style={{ marginBottom: 16 }}>Chi tiết nhiệm vụ</h3>
            {detailLoading && <div>Đang tải chi tiết...</div>}
            {detailError && <div className="form-error">{detailError}</div>}
            {/* Hiển thị thông tin nhiệm vụ */}
            {selectedTask && (
              <div style={{
                marginBottom: 18,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 0,
                minWidth: 600,
                maxWidth: 1100
              }}>
                <div style={{ padding: '6px 0' }}><b>Tên nhiệm vụ:</b></div>
                <div style={{ padding: '6px 0' }}>{selectedTask.TieuDe}</div>
                <div style={{ padding: '6px 0' }}><b>Tên lớp:</b></div>
                <div style={{ padding: '6px 0' }}>{selectedTask.TenLop}</div>
                <div style={{ padding: '6px 0' }}><b>Mức độ ưu tiên:</b></div>
                <div style={{ padding: '6px 0' }}>{selectedTask.DoUuTien}</div>
                <div style={{ padding: '6px 0' }}><b>Hạn hoàn thành:</b></div>
                <div style={{ padding: '6px 0' }}>{selectedTask.HanHoanThanh ? new Date(selectedTask.HanHoanThanh).toLocaleDateString('vi-VN') : ''}</div>
                <div style={{ padding: '6px 0' }}><b>Ngày tạo:</b></div>
                <div style={{ padding: '6px 0' }}>{selectedTask.NgayTao ? new Date(selectedTask.NgayTao).toLocaleDateString('vi-VN') : ''}</div>
                <div style={{ padding: '6px 0' }}><b>Người giao:</b></div>
                <div style={{ padding: '6px 0' }}>{selectedTask.TenNguoiGiao || ''}</div>
                <div style={{ gridColumn: '1 / span 2', padding: '6px 0' }}>
                  <b>Mô tả:</b>
                  <div style={{
                    background: '#f7f9fc',
                    borderRadius: 6,
                    padding: '8px 12px',
                    marginTop: 4,
                    color: '#333',
                    fontWeight: 400,
                    whiteSpace: 'pre-line'
                  }}>
                    {selectedTask.MoTa}
                  </div>
                </div>
                <div style={{ gridColumn: '1 / span 2', padding: '6px 0' }}>
                  <b>Tệp đính kèm:</b>{' '}
                  {selectedTask.TepDinhKem
                    ? (
                      <a
                        href={selectedTask.TepDinhKem.startsWith('http') ? selectedTask.TepDinhKem : `http://localhost:8080/uploads/${selectedTask.TepDinhKem.replace(/^(App[\\/])?(uploads[\\/])?/i, '').replace(/^[/\\]+/, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#2563eb', textDecoration: 'underline', marginLeft: 6 }}
                      >
                        Xem file
                      </a>
                    )
                    : <span style={{ color: '#888', marginLeft: 6 }}>Không có</span>
                  }
                </div>
              </div>
            )}
            {/* Hiển thị danh sách chi tiết nộp bài */}
            {Array.isArray(taskDetail) && taskDetail.length > 0 && (
              <div style={{ marginBottom: 18, width: '100%', overflowX: 'auto' }}>
                <h4 style={{ margin: '10px 0 8px 0', color: '#2563eb' }}>Danh sách nộp bài</h4>
                <div style={{ width: '100%', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, minWidth: 900 }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: 4 }}>Họ tên</th>
                        <th style={{ textAlign: 'left', padding: 4 }}>Vai trò</th>
                        <th style={{ textAlign: 'left', padding: 4 }}>Email</th>
                        <th style={{ textAlign: 'left', padding: 4 }}>SĐT</th>
                        <th style={{ textAlign: 'left', padding: 4 }}>Trạng thái</th>
                        <th style={{ textAlign: 'left', padding: 4 }}>Ghi chú</th>
                        <th style={{ textAlign: 'left', padding: 4 }}>Tệp kết quả</th>
                        <th style={{ textAlign: 'left', padding: 4 }}>Ngày cập nhật</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taskDetail.map((ct: any) => (
                        <tr key={ct.MaChiTietNhiemVu}>
                          <td style={{ padding: 4 }}>{ct.HoTen || ''}</td>
                          <td style={{ padding: 4 }}>{ct.VaiTro || ''}</td>
                          <td style={{ padding: 4 }}>{ct.Email || ''}</td>
                          <td style={{ padding: 4 }}>{ct.SoDienThoai || ''}</td>
                          <td style={{ padding: 4 }}>
                            {ct.TepKetQua
                              ? <span style={{ color: '#2563eb', fontWeight: 600 }}>Đã nộp bài</span>
                              : <span style={{ color: '#888' }}>Chưa nộp</span>
                            }
                          </td>
                          <td style={{ padding: 4 }}>{ct.GhiChuTienDo || ''}</td>
                          <td style={{ padding: 4 }}>
                            {ct.TepKetQua
                              ? (
                                <a
                                  href={ct.TepKetQua.startsWith('http') ? ct.TepKetQua : `http://localhost:8080/uploads/${ct.TepKetQua.replace(/^(App[\\/])?(uploads[\\/])?/i, '').replace(/^[/\\]+/, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Xem file
                                </a>
                              )
                              : <span style={{ color: '#888' }}>Chưa nộp</span>
                            }
                          </td>
                          <td style={{ padding: 4 }}>
                            {ct.NgayCapNhat ? new Date(ct.NgayCapNhat).toLocaleString('vi-VN') : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {/* Form nộp bài */}
            <hr style={{ margin: '18px 0 10px 0' }} />
            <NopBaiForm maNhiemVu={selectedTask.MaNhiemVu} onSuccess={() => fetchTaskDetail(selectedTask.MaNhiemVu)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;

function NopBaiForm({ maNhiemVu, onSuccess }: { maNhiemVu: number, onSuccess?: () => void }) {
  const { user } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!file) {
      setMsg('Vui lòng chọn file để nộp.');
      return;
    }
    if (!user?.userId) {
      setMsg('Không xác định được người dùng.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('TepNop', file);
      formData.append('MaNguoiDung', user.userId.toString());
      formData.append('GhiChu', note);
      await axios.post(`/nhiemvu/${maNhiemVu}/nopbai`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMsg('✅ Nộp bài thành công!');
      setFile(null);
      setNote('');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setMsg(
        err?.response?.data?.message ||
        (typeof err?.response?.data === 'string' ? err.response.data : '') ||
        '❌ Lỗi khi nộp bài. Vui lòng thử lại!'
      );
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        marginTop: 8,
        background: '#fff',
        borderRadius: 10,
        boxShadow: '0 1px 4px #2563eb11',
        padding: '18px 18px 10px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}
    >
      <div style={{ marginBottom: 4, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontWeight: 600, color: '#2563eb', marginBottom: 2 }}>Nộp bài:</label>
        <input
          type="file"
          onChange={handleFileChange}
          style={{
            border: '1px solid #cbd5e1',
            borderRadius: 7,
            padding: '7px 10px',
            background: '#f9fafe',
            fontSize: 15
          }}
        />
      </div>
      <div style={{ marginBottom: 4 }}>
        <input
          type="text"
          placeholder="Ghi chú (nếu có)"
          value={note}
          onChange={e => setNote(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: 7,
            border: '1px solid #cbd5e1',
            fontSize: 15,
            background: '#f9fafe'
          }}
        />
      </div>
      {msg && (
        <div
          style={{
            color: msg.startsWith('✅') ? '#2563eb' : '#d32f2f',
            marginBottom: 6,
            background: msg.startsWith('✅') ? '#e8f0fe' : '#ffe5e5',
            borderRadius: 6,
            padding: '6px 10px',
            fontWeight: 500
          }}
        >
          {msg}
        </div>
      )}
      <button
        type="submit"
        className="action-btn"
        disabled={loading}
        style={{
          background: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '0.5rem 1.2rem',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: 16,
          marginTop: 2,
          transition: 'background 0.2s'
        }}
      >
        <i className="fas fa-upload"></i> {loading ? 'Đang nộp...' : 'Nộp bài'}
      </button>
    </form>
  );
}
