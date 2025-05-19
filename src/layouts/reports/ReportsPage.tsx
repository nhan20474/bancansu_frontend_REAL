import React, { useEffect, useState } from 'react';
import axios from '../../api/axiosConfig';
import './ReportsPage.css';

interface ReportStats {
  totalTasks: number;
  completedTasks: number;
  onTimeRate: number;
  avgFeedback: number;
  officerCount: number;
  studentCount: number;
}

const ReportsPage: React.FC = () => {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get('/api/reports/overview')
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Không thể tải dữ liệu thống kê.');
        setLoading(false);
      });
  }, []);

  const handleExport = async (type: 'excel' | 'pdf') => {
    try {
      const res = await axios.get(`/api/reports/export?type=${type}`, {
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
                <div className="card-title">Nhiệm vụ</div>
                <div className="card-value">{stats.totalTasks}</div>
                <div className="card-desc">Tổng số nhiệm vụ</div>
              </div>
              <div className="report-card green">
                <div className="card-title">Hoàn thành</div>
                <div className="card-value">{stats.completedTasks}</div>
                <div className="card-desc">Đã hoàn thành</div>
              </div>
              <div className="report-card orange">
                <div className="card-title">Đúng hạn</div>
                <div className="card-value">{stats.onTimeRate}%</div>
                <div className="card-desc">Tỷ lệ đúng hạn</div>
              </div>
              <div className="report-card purple">
                <div className="card-title">Đánh giá TB</div>
                <div className="card-value">{stats.avgFeedback}/5</div>
                <div className="card-desc">Điểm cán sự TB</div>
              </div>
              <div className="report-card pink">
                <div className="card-title">Cán sự</div>
                <div className="card-value">{stats.officerCount}</div>
                <div className="card-desc">Số cán sự</div>
              </div>
              <div className="report-card cyan">
                <div className="card-title">Sinh viên</div>
                <div className="card-value">{stats.studentCount}</div>
                <div className="card-desc">Số sinh viên</div>
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
