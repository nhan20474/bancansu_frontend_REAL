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
interface DiemTrungBinhCanSuTheoLop {
  TenLop: string;
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
  const [avgOfficerScoresByClass, setAvgOfficerScoresByClass] = useState<DiemTrungBinhCanSuTheoLop[]>([]);
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

  useEffect(() => {
    // Gọi API lấy điểm trung bình cán sự theo lớp
    axios
      .get<DiemTrungBinhCanSuTheoLop[]>('/thongke/diemtrungbinh-cansu')
      .then(res => {
        setAvgOfficerScoresByClass(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => setAvgOfficerScoresByClass([]));
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

  // Chỉ chặn sinh viên, các vai trò khác đều xem được
  if (userRole === 'sinhvien') {
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

          

            {/* Bảng điểm trung bình cán sự theo lớp */}
            <div className="credibility-section" style={{ marginTop: 32 }}>
              <div className="section-header">
                <h3 className="section-title">
                  <span className="section-icon">🏫</span>
                   Thống kê độ tín nhiệm trung bình của cán sự
                </h3>
                <p className="section-subtitle">
                  Thống kê độ tín nhiệm trung bình của cán sự
                </p>
              </div>
              <div className="table-container">
                <table className="credibility-table">
                  <thead>
                    <tr>
                      <th className="stt-col">STT</th>
                      <th className="name-col">Tên lớp</th>
                      <th className="name-col">Tên cán sự</th>
                      <th className="score-col">Độ tính nhiệm </th>
                    </tr>
                  </thead>
                  <tbody>
                    {avgOfficerScoresByClass.length === 0 ? (
                      <tr className="empty-row">
                        <td colSpan={4}>
                          <div className="empty-state">
                            <span className="empty-icon">📊</span>
                            <p>Chưa có dữ liệu thống kê</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      avgOfficerScoresByClass.map((row, idx) => (
                        <tr key={row.TenLop + row.HoTen}>
                          <td className="stt-cell">
                            <span className="stt-number">{idx + 1}</span>
                          </td>
                          <td className="name-cell">{row.TenLop}</td>
                          <td className="name-cell">{row.HoTen}</td>
                          <td className="score-cell">
                            <span className="score-value">
                              {row.DiemTrungBinh === null || row.DiemTrungBinh === undefined || isNaN(Number(row.DiemTrungBinh))
                                ? '-'
                                : Number(row.DiemTrungBinh).toFixed(2).replace(/\.?0+$/, '')}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Nút xuất báo cáo */}
            <div className="reports-btn-group">
              <button
                className="reports-btn"
                type="button"
                onClick={() => handleExport('excel')}
                disabled={loading}
              >
                Xuất báo cáo lớp học Excel
              </button>
             
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
