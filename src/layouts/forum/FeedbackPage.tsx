/**
 * FeedbackPage: Allows users to submit feedback about officers or the system.
 */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './FeedbackPage.css';

const API_BASE = 'http://localhost:8080';

interface Officer {
  MaNguoiDung: number;
  HoTen: string;
  ChucVu?: string;
  Lop?: string;
  // Thêm các trường cho dữ liệu mới từ API
  TenCanSu?: string;
  TenLop?: string;
}

interface FeedbackItem {
  MaDanhGia: number;
  NguoiGui: number;
  TenNguoiGui: string;
  CanSuDuocDanhGia: number;
  TenCanSu: string;
  TieuChi: string;
  NoiDung: string;
  NgayGui: string;
  MucLabel?: string; // Đã thêm trường này để nhận nhãn mức độ từ backend
  AnDanh?: boolean; // Thêm trường này để hỗ trợ ẩn danh
}

// Danh sách tiêu chí đánh giá với tông màu tối giản
const CRITERIA_OPTIONS = [
  { value: 1, label: 'Cần cải thiện', text: 'Cần cải thiện', color: '#dc2626' },
  { value: 2, label: 'Trung bình', text: 'Trung bình', color: '#ea580c' },
  { value: 3, label: 'Khá', text: 'Khá', color: '#ca8a04' },
  { value: 4, label: 'Tốt', text: 'Tốt', color: '#16a34a' },
  { value: 5, label: 'Xuất sắc', text: 'Xuất sắc', color: '#059669' }
];

const FeedbackPage: React.FC = () => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [criteria, setCriteria] = useState<number>(3);
  const [comment, setComment] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [recentFeedbacks, setRecentFeedbacks] = useState<FeedbackItem[]>([]);
  const [feedbackStats, setFeedbackStats] = useState({ total: 0, avgRating: 0 });
  const [anonymous, setAnonymous] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setDataLoading(true);
    try {
      await Promise.all([
        loadOfficers(),
        loadRecentFeedbacks()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const loadOfficers = async () => {
    try {
      // Lấy danh sách cán sự từ backend (role=cansu)
      const response = await axios.get(`${API_BASE}/api/cansu`);
      if (response.data && Array.isArray(response.data)) {
        // Chuẩn hóa dữ liệu officers để luôn có HoTen
        const officersData = response.data.map((o: any) => ({
          ...o,
          HoTen: o.HoTen || o.TenCanSu || '', // Ưu tiên HoTen, fallback TenCanSu
          ChucVu: o.ChucVu,
          MaNguoiDung: o.MaNguoiDung,
        }));
        setOfficers(officersData);
      } else {
        setOfficers([]);
      }
    } catch (error) {
      console.error('Error loading officers:', error);
      setOfficers([]);
    }
  };

  const loadRecentFeedbacks = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/danhgia`);
      if (response.data && Array.isArray(response.data)) {
        // Đảm bảo mỗi feedback có đủ các trường cần thiết, tránh lỗi khi render
        const recentData = response.data
          .map((f: any) => ({
            MaDanhGia: f.MaDanhGia,
            TenCanSu: f.TenCanSu || '',
            TieuChi: f.TieuChi || '',
            NoiDung: f.NoiDung || '',
            TenNguoiGui: f.TenNguoiGui || 'Ẩn danh',
            NgayGui: f.NgayGui || '',
            MucLabel: f.MucLabel || '',
            // Các trường dưới đây có thể không có trong API, nên để undefined nếu không có
            NguoiGui: f.NguoiGui,
            CanSuDuocDanhGia: f.CanSuDuocDanhGia,
            AnDanh: f.AnDanh !== undefined ? f.AnDanh : (f.TenNguoiGui === 'Ẩn danh')
          }))
          .sort((a, b) => new Date(b.NgayGui).getTime() - new Date(a.NgayGui).getTime())
          .slice(0, 6);

        setRecentFeedbacks(recentData);

        const total = recentData.length;
        const ratings = recentData
          .map(f => getStarsFromCriteria(f.TieuChi, f.MucLabel))
          .filter(r => r > 0);
        const avgRating = ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
          : 0;

        setFeedbackStats({
          total,
          avgRating: Math.round(avgRating * 10) / 10
        });
      } else {
        setRecentFeedbacks([]);
        setFeedbackStats({ total: 0, avgRating: 0 });
      }
    } catch (error) {
      console.error('Error loading feedbacks:', error);
      setRecentFeedbacks([]);
      setFeedbackStats({ total: 0, avgRating: 0 });
    }
  };

 
  const normalizeCriteriaLabel = (tieuChi: string, mucLabel?: string): string => {
    // Ưu tiên MucLabel nếu hợp lệ
    const validLabels = ['Cần cải thiện', 'Trung bình', 'Khá', 'Tốt', 'Xuất sắc'];
    if (mucLabel && validLabels.includes(mucLabel)) return mucLabel;

    // Map các tiêu chí cũ hoặc đặc biệt về nhãn chuẩn
    const map: { [key: string]: string } = {
      'Xuất sắc': 'Xuất sắc',
      'Tốt': 'Tốt',
      'Khá': 'Khá',
      'Trung bình': 'Trung bình',
      'Cần cải thiện': 'Cần cải thiện',
      'Tích cực': 'Tốt',
      'Chăm chỉ': 'Tốt',
      'Rất tốt': 'Tốt',
      'Bình thường': 'Khá'
    };
    // Nếu là dạng "Điểm: x"
    const match = tieuChi.match(/Điểm: (\d)/);
    if (match) {
      const val = parseInt(match[1]);
      return validLabels[val - 1] || 'Khá';
    }
    return map[tieuChi] || 'Khá';
  };

  // Lấy số sao từ nhãn chuẩn hóa
  const getStarsFromCriteria = (tieuChi: string, mucLabel?: string): number => {
    const label = normalizeCriteriaLabel(tieuChi, mucLabel);
    const criteriaMap: { [key: string]: number } = {
      'Cần cải thiện': 1,
      'Trung bình': 2,
      'Khá': 3,
      'Tốt': 4,
      'Xuất sắc': 5
    };
    return criteriaMap[label] || 3;
  };

  // Lấy màu sắc từ nhãn chuẩn hóa
  const getCriteriaColor = (tieuChi: string, mucLabel?: string): string => {
    const stars = getStarsFromCriteria(tieuChi, mucLabel);
    const criteriaItem = CRITERIA_OPTIONS.find(opt => opt.value === stars);
    return criteriaItem?.color || '#6b7280';
  };

  // Hiển thị số sao từ nhãn chuẩn hóa
  const getStarRating = (tieuChi: string, mucLabel?: string) => {
    const stars = getStarsFromCriteria(tieuChi, mucLabel);
    return stars > 0 ? '★'.repeat(stars) + '☆'.repeat(5 - stars) : '📝';
  };

  const getCurrentCriteria = () => {
    return CRITERIA_OPTIONS.find(opt => opt.value === criteria) || CRITERIA_OPTIONS[2];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setError(null);
    setLoading(true);

    try {
      // Nếu gửi ẩn danh thì bắt buộc phải chọn cán sự, mức độ và nhập nhận xét
      if (anonymous) {
        if (!selectedOfficer || !criteria || !comment.trim()) {
          setError('Thiếu thông tin đánh giá.');
          setLoading(false);
          return;
        }
      } else {
        // Không ẩn danh thì chỉ cần chọn cán sự và mức độ
        if (!selectedOfficer || !criteria) {
          setError('Thiếu thông tin đánh giá.');
          setLoading(false);
          return;
        }
      }

      const currentCriteria = getCurrentCriteria();
      if (isNaN(Number(selectedOfficer))) {
        setError('Vui lòng chọn cán sự hợp lệ.');
        setLoading(false);
        return;
      }

      // Lấy đúng ID người dùng hiện tại khi gửi đánh giá
      const payload = {
        NguoiGui: anonymous ? null : currentUserId,
        CanSuDuocDanhGia: Number(selectedOfficer),
        TieuChi: currentCriteria.text,
        NoiDung: comment || `Đánh giá: ${currentCriteria.text}`,
        AnDanh: anonymous ? true : false
      };

      // Đổi endpoint sang /api/danhgia cho đồng bộ với backend
      const response = await axios.post(`${API_BASE}/api/danhgia`, payload);

      if (response.data && response.data.success) {
        setMsg('Đánh giá đã được gửi thành công!');
        setSelectedOfficer('');
        setCriteria(3);
        setComment('');
        setAnonymous(false);
        await loadRecentFeedbacks();
      } else {
        setError('Có lỗi xảy ra khi gửi đánh giá.');
      }

    } catch (err: any) {
      // Hiển thị lỗi chi tiết từ backend nếu có
      setError(err?.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
    try {
      await axios.delete(`${API_BASE}/api/danhgia/${feedbackId}`);
      await loadRecentFeedbacks();
    } catch (err) {
      alert('Không thể xóa đánh giá. Vui lòng thử lại.');
    }
  };

  const getTimeAgo = (dateString: string) => {
    if (!dateString) return '';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) return `${diffInDays} ngày trước`;
    if (diffInHours > 0) return `${diffInHours} giờ trước`;
    return '';
  };

  if (dataLoading) {
    return (
      <div className="feedback-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const currentCriteria = getCurrentCriteria();

  // Giả lập id và tên người dùng hiện tại (cần thay bằng dữ liệu thực tế khi có auth)
  const getCurrentUserId = () => {
    // Ví dụ: lưu user vào localStorage dạng { MaNguoiDung: 123, ... }
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.MaNguoiDung || user.userId || 1; // fallback 1 nếu không có
      }
    } catch {}
    return 1;
  };

  const currentUserId = getCurrentUserId();
  const currentUserName = "Tôi";

  return (
    <div className="feedback-page">
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <h1>Đánh giá cán sự lớp</h1>
          <p>Đóng góp ý kiến để cải thiện hoạt động lớp</p>
        </div>

        <div className="content-grid">
          {/* Form Section */}
          <div className="form-section">
            <div className="form-card">
              <h2>Gửi đánh giá</h2>
              
              {msg && <div className="message success">{msg}</div>}
              {error && <div className="message error">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Chọn cán sự</label>
                  <select
                    value={selectedOfficer}
                    onChange={e => setSelectedOfficer(e.target.value)}
                    required
                    disabled={officers.length === 0}
                  >
                    <option value="">
                      {officers.length === 0 ? "Đang tải..." : "-- Chọn cán sự --"}
                    </option>
                    {officers.map(o => (
                      <option key={o.MaNguoiDung} value={o.MaNguoiDung}>
                        {o.HoTen}{o.ChucVu ? ` (${o.ChucVu})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={anonymous}
                    onChange={e => setAnonymous(e.target.checked)}
                    style={{ width: 18, height: 18 }}
                  />
                  <label htmlFor="anonymous" style={{ margin: 0, cursor: 'pointer', fontSize: '1rem' }}>
                    Gửi ẩn danh
                  </label>
                </div>

                <div className="form-group">
                  <label>Mức độ đánh giá</label>
                  
                  <div className="rating-container">
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={criteria}
                      onChange={e => setCriteria(parseInt(e.target.value))}
                      className="rating-slider"
                      disabled={officers.length === 0}
                    />
                    
                    <div className="rating-labels">
                      {CRITERIA_OPTIONS.map(opt => (
                        <span 
                          key={opt.value}
                          className={criteria === opt.value ? 'active' : ''}
                          style={{ color: criteria === opt.value ? opt.color : '#9ca3af' }}
                        >
                          {opt.label}
                        </span>
                      ))}
                    </div>

                    <div className="rating-display">
                      <div className="rating-value" style={{ color: currentCriteria.color }}>
                        <span className="score">{criteria}</span>
                        <span className="stars">{'★'.repeat(criteria)}{'☆'.repeat(5 - criteria)}</span>
                      </div>
                      <div className="rating-text">
                        <strong>{currentCriteria.text}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Nhận xét <span className="optional">(tùy chọn)</span></label>
                  <textarea
                    placeholder={`Nhận xét về mức độ "${currentCriteria.text}" của cán sự...`}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows={3}
                    disabled={officers.length === 0}
                  />
                </div>

                <button 
                  type="submit"
                  className="submit-btn"
                  disabled={loading || officers.length === 0}
                  style={{ backgroundColor: loading ? '#9ca3af' : currentCriteria.color }}
                >
                  {loading ? 'Đang gửi...' : `Gửi đánh giá "${currentCriteria.text}"`}
                </button>
              </form>
            </div>
          </div>

          {/* Recent Feedbacks */}
          <div className="feedback-section">
            <div className="feedback-card">
              <div className="feedback-header">
                <h2>Đánh giá gần đây</h2>
                <div className="stats">
                  <span>{feedbackStats.total} đánh giá</span>
                  <span>TB: {feedbackStats.avgRating}/5</span>
                </div>
              </div>
              
              <div className="feedback-list">
                {recentFeedbacks.length === 0 ? (
                  <div className="empty-state">
                    <p>Chưa có đánh giá nào</p>
                  </div>
                ) : (
                  recentFeedbacks.map(feedback => {
                    const label = normalizeCriteriaLabel(feedback.TieuChi, feedback.MucLabel);
                    // Hiển thị tên người gửi: nếu là ẩn danh thì "Ẩn danh", nếu là người đăng nhập thì "Tôi", còn lại lấy tên từ API
                    let displaySender = "Ẩn danh";
                    if (feedback.TenNguoiGui !== "Ẩn danh") {
                      if (feedback.NguoiGui && feedback.NguoiGui === currentUserId) {
                        displaySender = "Tôi";
                      } else {
                        displaySender = feedback.TenNguoiGui;
                      }
                    }
                    return (
                      <div key={feedback.MaDanhGia} className="feedback-item">
                        <div className="feedback-top">
                          <strong className="target-name">
                            {feedback.TenCanSu}
                            <span style={{ color: '#64748b', fontWeight: 400, marginLeft: 8, fontSize: '0.98em' }}>
                              {feedback.CanSuDuocDanhGia ? `(ID: ${feedback.CanSuDuocDanhGia})` : ''}
                            </span>
                          </strong>
                          <div className="rating-info">
                            <span 
                              className="stars"
                              style={{ color: getCriteriaColor(feedback.TieuChi, feedback.MucLabel) }}
                            >
                              {getStarRating(feedback.TieuChi, feedback.MucLabel)}
                            </span>
                            <span className="criteria">
                              {label}
                            </span>
                          </div>
                          {/* Nút xóa chỉ hiện với feedback của chính mình */}
                          {feedback.NguoiGui === currentUserId && (
                            <button
                              className="delete-feedback-btn"
                              title="Xóa đánh giá"
                              style={{
                                marginLeft: 8,
                                background: 'none',
                                border: 'none',
                                color: '#d32f2f',
                                cursor: 'pointer',
                                fontSize: '1.1em'
                              }}
                              onClick={() => handleDeleteFeedback(feedback.MaDanhGia)}
                            >
                              🗑
                            </button>
                          )}
                        </div>
                        {feedback.NoiDung && (
                          <div className="feedback-content">
                            "{feedback.NoiDung}"
                          </div>
                        )}
                        <div className="feedback-bottom">
                          <span className="author">
                            Người gửi: <b>{displaySender}</b>
                          </span>
                          <span className="time">{getTimeAgo(feedback.NgayGui)}</span>
                          <span className="date" style={{ marginLeft: 8, color: '#64748b', fontSize: '0.95em' }}>
                            {feedback.NgayGui ? new Date(feedback.NgayGui).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {recentFeedbacks.length > 0 && (
                <div className="feedback-footer">
                  <button 
                    className="view-more"
                    onClick={() => window.location.href = '/reports'}
                  >
                    Xem thống kê chi tiết
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;