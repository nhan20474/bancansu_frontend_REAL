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
      // Thử endpoint thống kê trước
      const statsResponse = await axios.get(`${API_BASE}/thongke`);
      if (statsResponse.data?.diemTrungBinhCanSu) {
        const officersFromStats = statsResponse.data.diemTrungBinhCanSu.map((cs: any) => ({
          MaNguoiDung: cs.MaNguoiDung,
          HoTen: cs.HoTen,
          ChucVu: 'Cán sự'
        }));
        setOfficers(officersFromStats);
        return;
      }
    } catch (error) {
      console.error('Error loading from stats API:', error);
    }

    // Fallback data
    const mockOfficers: Officer[] = [
      { MaNguoiDung: 3, HoTen: 'Nguyễn Trung Kiên', ChucVu: 'Lớp trưởng' },
      { MaNguoiDung: 4, HoTen: 'Hà Thái Cơ', ChucVu: 'Cán sự' },
      { MaNguoiDung: 5, HoTen: 'Huỳnh Minh Toàn', ChucVu: 'Cán sự' },
      { MaNguoiDung: 6, HoTen: 'Trần Hoàng Huy', ChucVu: 'Cán sự' },
      { MaNguoiDung: 7, HoTen: 'Nguyễn Phạm Tấn An', ChucVu: 'Cán sự' }
    ];
    setOfficers(mockOfficers);
  };

  const loadRecentFeedbacks = async () => {
    try {
      const response = await axios.get(`${API_BASE}/danhgia`);
      
      if (response.data && Array.isArray(response.data)) {
        const recentData = response.data
          .sort((a, b) => new Date(b.NgayGui).getTime() - new Date(a.NgayGui).getTime())
          .slice(0, 6);
        
        setRecentFeedbacks(recentData);
        
        const total = recentData.length;
        const ratings = recentData
          .map(f => getStarsFromCriteria(f.TieuChi))
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
      // Mock data
      const mockFeedbacks: FeedbackItem[] = [
        {
          MaDanhGia: 1,
          NguoiGui: 4,
          TenNguoiGui: 'Hà Thái Cơ',
          CanSuDuocDanhGia: 5,
          TenCanSu: 'Huỳnh Minh Toàn',
          TieuChi: 'Tốt',
          NoiDung: 'Làm việc tích cực, hỗ trợ bạn học tập tốt',
          NgayGui: new Date().toISOString()
        }
      ];
      setRecentFeedbacks(mockFeedbacks);
      setFeedbackStats({ total: 1, avgRating: 4.0 });
    }
  };

  // Utility functions
  const getStarsFromCriteria = (tieuChi: string): number => {
    const criteriaMap: { [key: string]: number } = {
      'Xuất sắc': 5, 'Tốt': 4, 'Khá': 3, 'Trung bình': 2, 'Cần cải thiện': 1,
      'Tích cực': 4, 'Chăm chỉ': 4, 'Rất tốt': 4, 'Bình thường': 3
    };
    
    const oldFormatMatch = tieuChi.match(/Điểm: (\d)/);
    if (oldFormatMatch) return parseInt(oldFormatMatch[1]);
    
    return criteriaMap[tieuChi] || 0;
  };

  const getCurrentCriteria = () => {
    return CRITERIA_OPTIONS.find(opt => opt.value === criteria) || CRITERIA_OPTIONS[2];
  };

  const getCriteriaColor = (tieuChi: string): string => {
    const stars = getStarsFromCriteria(tieuChi);
    const criteriaItem = CRITERIA_OPTIONS.find(opt => opt.value === stars);
    return criteriaItem?.color || '#6b7280';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setError(null);
    setLoading(true);

    try {
      if (!selectedOfficer || !criteria) {
        setError('Vui lòng chọn cán sự và mức độ đánh giá.');
        setLoading(false);
        return;
      }

      const currentCriteria = getCurrentCriteria();
      const payload = {
        NguoiGui: 1,
        CanSuDuocDanhGia: parseInt(selectedOfficer),
        TieuChi: currentCriteria.text,
        NoiDung: comment || `Đánh giá: ${currentCriteria.text}`,
      };

      const response = await axios.post(`${API_BASE}/danhgia`, payload);
      
      if (response.data) {
        setMsg('Đánh giá đã được gửi thành công!');
        setSelectedOfficer('');
        setCriteria(3);
        setComment('');
        await loadRecentFeedbacks();
      } else {
        setError('Có lỗi xảy ra khi gửi đánh giá.');
      }

    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      setError(err.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const getStarRating = (tieuChi: string) => {
    const stars = getStarsFromCriteria(tieuChi);
    return stars > 0 ? '★'.repeat(stars) + '☆'.repeat(5 - stars) : '📝';
  };

  const getTimeAgo = (dateString: string) => {
    if (!dateString) return 'Vừa xong';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) return `${diffInDays} ngày trước`;
    if (diffInHours > 0) return `${diffInHours} giờ trước`;
    return 'Vừa xong';
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
                        {o.HoTen} {o.ChucVu && `(${o.ChucVu})`}
                      </option>
                    ))}
                  </select>
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
                  recentFeedbacks.map(feedback => (
                    <div key={feedback.MaDanhGia} className="feedback-item">
                      <div className="feedback-top">
                        <strong className="target-name">{feedback.TenCanSu}</strong>
                        <div className="rating-info">
                          <span 
                            className="stars"
                            style={{ color: getCriteriaColor(feedback.TieuChi) }}
                          >
                            {getStarRating(feedback.TieuChi)}
                          </span>
                          <span className="criteria">{feedback.TieuChi}</span>
                        </div>
                      </div>
                      
                      {feedback.NoiDung && (
                        <div className="feedback-content">
                          "{feedback.NoiDung}"
                        </div>
                      )}
                      
                      <div className="feedback-bottom">
                        <span className="author">{feedback.TenNguoiGui}</span>
                        <span className="time">{getTimeAgo(feedback.NgayGui)}</span>
                      </div>
                    </div>
                  ))
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