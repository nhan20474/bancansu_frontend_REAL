import React, { useEffect, useState } from 'react';
import axios from '../../api/axiosConfig';
import './ReportsPage.css';

// Định nghĩa kiểu dữ liệu cho API mới
interface TongQuan {
  TongLop: number;
  TongSinhVien: number;
  TongCanSu: number;
  TongNhiemVu: number;
  TongThongBao: number;
}
interface DiemTrungBinhCanSu {
  MaNguoiDung: number;
  HoTen: string;
  DiemTrungBinh: number;
}
interface ThongKeResponse {
  tongquan: TongQuan;
  diemTrungBinhCanSu: DiemTrungBinhCanSu[];
}

const ReportsPage: React.FC = () => {
  const [stats, setStats] = useState<TongQuan | null>(null);
  const [officerScores, setOfficerScores] = useState<DiemTrungBinhCanSu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get<ThongKeResponse>('/thongke')
      .then(res => {
        setStats(res.data.tongquan);
        setOfficerScores(res.data.diemTrungBinhCanSu);
        // Thêm dòng này để kiểm tra dữ liệu trả về
        console.log('DiemTrungBinhCanSu:', res.data.diemTrungBinhCanSu);
        setLoading(false);
      })
      .catch(() => {
        setError('Không thể tải dữ liệu thống kê.');
        setLoading(false);
      });
  }, []);

  const handleExport = async (type: 'excel' | 'pdf') => {
    try {
      // Chỉ cần gọi 'reports/export?type=excel' nếu đã có baseURL là /api
      const res = await axios.get(`reports/export?type=${type}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `baocao_lophoc.${type === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Xuất báo cáo thất bại!');
    }
  };

  // Lấy role từ localStorage (hoặc context nếu có)
  function getUserRole() {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return (
          user.VaiTro ||
          user.role ||
          user.vaitro ||
          user.Role ||
          user.ROLE ||
          ''
        ).toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
      }
    } catch {}
    return '';
  }
  const userRole = getUserRole();

  // Chỉ cho phép admin hoặc giảng viên xem trang này
  if (userRole !== 'admin' && userRole !== 'giangvien') {
    return (
      <div className="reports-container">
        <div className="reports-form" style={{ maxWidth: 700, textAlign: 'center', color: '#d32f2f', padding: 32 }}>
          Bạn không có quyền truy cập chức năng thống kê này.
        </div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="reports-form" style={{ maxWidth: 700 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>📊 Thống kê & Báo cáo lớp học</h2>
        {loading && <div className="form-success">Đang tải dữ liệu...</div>}
        {error && <div className="form-error">{error}</div>}

        {stats && (
          <>
            {/* Card số liệu tổng quan */}
            <div className="reports-cards">
              <div className="report-card blue">
                <div className="card-title">Lớp học</div>
                <div className="card-value">{stats.TongLop}</div>
                <div className="card-desc">Tổng số lớp</div>
              </div>
              <div className="report-card cyan">
                <div className="card-title">Sinh viên</div>
                <div className="card-value">{stats.TongSinhVien}</div>
                <div className="card-desc">Tổng số sinh viên</div>
              </div>
              <div className="report-card pink">
                <div className="card-title">Cán sự</div>
                <div className="card-value">{stats.TongCanSu}</div>
                <div className="card-desc">Tổng số cán sự</div>
              </div>
              <div className="report-card orange">
                <div className="card-title">Nhiệm vụ</div>
                <div className="card-value">{stats.TongNhiemVu}</div>
                <div className="card-desc">Tổng số nhiệm vụ</div>
              </div>
              <div className="report-card green">
                <div className="card-title">Thông báo</div>
                <div className="card-value">{stats.TongThongBao}</div>
                <div className="card-desc">Tổng số thông báo</div>
              </div>
            </div>

            {/* Bảng điểm trung bình cán sự */}
            <div style={{ marginTop: 32 }}>
              <h3 style={{ marginBottom: 12 }}>🎯 Điểm trung bình cán sự</h3>
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Họ tên cán sự</th>
                    <th>Điểm trung bình</th>
                  </tr>
                </thead>
                <tbody>
                  {officerScores.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center' }}>Không có dữ liệu</td>
                    </tr>
                  ) : (
                    officerScores.map((o, idx) => {
                      // Ép kiểu về số thực nếu cần
                      const diem = typeof o.DiemTrungBinh === 'string'
                        ? parseFloat(o.DiemTrungBinh)
                        : o.DiemTrungBinh;
                      return (
                        <tr key={o.MaNguoiDung}>
                          <td>{idx + 1}</td>
                          <td>{o.HoTen}</td>
                          <td>
                            <span style={{
                              color:
                                diem >= 4.5 ? '#059669' :
                                diem >= 4 ? '#16a34a' :
                                diem >= 3 ? '#ca8a04' :
                                diem >= 2 ? '#ea580c' :
                                '#dc2626',
                              fontWeight: 600
                            }}>
                              {diem == null
                                ? '-'
                                : (Number.isInteger(diem)
                                    ? diem
                                    : diem.toFixed(2).replace(/\.?0+$/, ''))}{' '}
                              <span style={{ color: '#f59e42', fontSize: '1.1em' }}>
                                {diem && diem > 0
                                  ? '★'.repeat(Math.round(diem)) + '☆'.repeat(5 - Math.round(diem))
                                  : ''}
                              </span>
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Nút xuất báo cáo */}
            <div className="reports-btn-group">
              <button
                className="reports-btn"
                type="button"
                onClick={() => handleExport('excel')}
                disabled={loading}
              >
                Xuất báo cáo Excel
              </button>
              <button
                className="reports-btn"
                type="button"
                onClick={() => handleExport('pdf')}
                disabled={loading}
              >
                Xuất báo cáo PDF
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
