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
  const [criteria, setCriteria] = useState<number>(3); // Mặc định là 3 (Khá)
  const [comment, setComment] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [recentFeedbacks, setRecentFeedbacks] = useState<FeedbackItem[]>([]);
  const [feedbackStats, setFeedbackStats] = useState({ total: 0, avgRating: 0 });
  const [anonymous, setAnonymous] = useState(false);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);

  // Thêm state để hiển thị form sửa riêng biệt
  const [editingFeedback, setEditingFeedback] = useState<FeedbackItem | null>(null);

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

  // Khi gửi feedback ẩn danh, lưu id vào localStorage để nhận diện quyền sửa/xóa
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setError(null);
    setLoading(true);

    try {
      // Kiểm tra dữ liệu đầu vào
      if (!selectedOfficer || !criteria) {
        setError('Thiếu thông tin đánh giá.');
        setLoading(false);
        return;
      }
      if (anonymous && !comment.trim()) {
        setError('Vui lòng nhập nhận xét khi gửi ẩn danh.');
        setLoading(false);
        return;
      }

      if (isNaN(Number(selectedOfficer))) {
        setError('Vui lòng chọn cán sự hợp lệ.');
        setLoading(false);
        return;
      }

      const payload = {
        NguoiGui: anonymous ? null : currentUserId,
        CanSuDuocDanhGia: Number(selectedOfficer),
        TieuChi: criteria, // Gửi số (1-5) thay vì chuỗi
        NoiDung: comment || `Đánh giá: ${CRITERIA_OPTIONS.find(opt => opt.value === criteria)?.text || ''}`,
        AnDanh: anonymous ? true : false
      };

      // Thêm mới đánh giá
      const response = await axios.post(`${API_BASE}/api/danhgia`, payload);

      if (response.data && (response.data.success || response.data.MaDanhGia)) {
        setMsg('Đánh giá đã được gửi thành công!');
        setSelectedOfficer('');
        setCriteria(3);
        setComment('');
        setAnonymous(false);
        // Nếu gửi ẩn danh, lưu id vào localStorage (kiểu số, không trùng lặp)
        if (anonymous && response.data.MaDanhGia) {
          let myAnonIds: number[] = [];
          try {
            myAnonIds = JSON.parse(localStorage.getItem('my_anonymous_feedbacks') || '[]');
          } catch { myAnonIds = []; }
          myAnonIds = myAnonIds.map(Number);
          // Đảm bảo không trùng lặp và chỉ lưu tối đa 100 id gần nhất
          if (!myAnonIds.includes(Number(response.data.MaDanhGia))) {
            myAnonIds.push(Number(response.data.MaDanhGia));
            if (myAnonIds.length > 100) myAnonIds = myAnonIds.slice(-100);
            localStorage.setItem('my_anonymous_feedbacks', JSON.stringify(myAnonIds));
          }
        }
        await loadRecentFeedbacks();
      } else {
        setError('Có lỗi xảy ra khi gửi đánh giá.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Sửa đánh giá (hiện form sửa riêng)
  const handleEditFeedback = (feedback: FeedbackItem) => {
    setEditingFeedback(feedback);
    setSelectedOfficer(String(feedback.CanSuDuocDanhGia));
    setCriteria(getStarsFromCriteria(feedback.TieuChi, feedback.MucLabel));
    setComment(feedback.NoiDung || '');
    setAnonymous(feedback.AnDanh === true);
    setMsg(null);
    setError(null);
  };

  // Lưu cập nhật đánh giá
  const handleUpdateFeedback = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingFeedback) return;
    setLoading(true);
    setError(null);
    try {
      const currentCriteria = getCurrentCriteria();

      // Xác định giá trị NguoiGui và AnDanh gửi lên backend
      let nguoiGuiValue: number | null = null;
      let anDanhValue: boolean = false;

      if (editingFeedback.AnDanh) {
        // Nếu feedback gốc là ẩn danh
        if (!anonymous) {
          // Chuyển từ ẩn danh sang không ẩn danh: phải truyền NguoiGui hợp lệ
          if (!currentUserId || currentUserId === 0 || currentUserId === null || currentUserId === undefined) {
            setError('Không xác định được người gửi khi chuyển từ ẩn danh sang không ẩn danh. Vui lòng đăng nhập lại.');
            setLoading(false);
            return;
          }
          nguoiGuiValue = currentUserId;
          anDanhValue = false;
        } else {
          // Vẫn giữ ẩn danh
          nguoiGuiValue = null;
          anDanhValue = true;
        }
      } else {
        // Feedback gốc không ẩn danh
        if (anonymous) {
          nguoiGuiValue = null;
          anDanhValue = true;
        } else {
          nguoiGuiValue = currentUserId;
          anDanhValue = false;
        }
      }

      const payload = {
        TieuChi: criteria, // Gửi số (1-5) thay vì chuỗi
        NoiDung: comment || `Đánh giá: ${CRITERIA_OPTIONS.find(opt => opt.value === criteria)?.text || ''}`,
        AnDanh: anDanhValue,
        NguoiGui: nguoiGuiValue
      };
      await axios.put(`${API_BASE}/api/danhgia/${editingFeedback.MaDanhGia}`, payload);
      setMsg('Cập nhật đánh giá thành công!');
      setEditingFeedback(null);
      setSelectedOfficer('');
      setCriteria(3);
      setComment('');
      setAnonymous(false);
      await loadRecentFeedbacks();
    } catch (err: any) {
      // Hiển thị lỗi rõ ràng từ backend nếu có
      setError(err?.response?.data?.message || 'Không thể cập nhật đánh giá. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Xóa đánh giá (ẩn danh: chỉ admin hoặc người đã gửi feedback ẩn danh đó mới được xóa)
  const handleDeleteFeedback = async (feedbackId: number) => {
    const feedback = recentFeedbacks.find(fb => fb.MaDanhGia === feedbackId);
    const userRole = getUserRole();

    if (feedback?.AnDanh) {
      if (userRole === 'admin' || userRole === 'giangvien') {
        // admin hoặc giảng viên được xóa mọi feedback ẩn danh
      } else {
        let myAnonIds: number[] = [];
        try {
          myAnonIds = JSON.parse(localStorage.getItem('my_anonymous_feedbacks') || '[]');
        } catch { myAnonIds = []; }
        myAnonIds = myAnonIds.map(Number);
        if (!myAnonIds.includes(Number(feedbackId))) {
          setError('Bạn chỉ có thể xóa đánh giá ẩn danh do chính bạn gửi.');
          return;
        }
      }
    } else {
      if (String(feedback?.NguoiGui) !== String(currentUserId)) {
        setError('Bạn chỉ có thể xóa đánh giá của chính mình.');
        return;
      }
    }
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
    try {
      await axios.delete(`${API_BASE}/api/danhgia/${feedbackId}`);
      // Nếu là ẩn danh và user xóa chính feedback của mình, xóa id khỏi localStorage
      if (feedback?.AnDanh && userRole !== 'admin' && userRole !== 'giangvien') {
        let myAnonIds: number[] = [];
        try {
          myAnonIds = JSON.parse(localStorage.getItem('my_anonymous_feedbacks') || '[]');
        } catch { myAnonIds = []; }
        myAnonIds = myAnonIds.map(Number).filter((id: number) => id !== Number(feedbackId));
        localStorage.setItem('my_anonymous_feedbacks', JSON.stringify(myAnonIds));
      }
      await loadRecentFeedbacks();
      setMsg('Đã xóa đánh giá.');
    } catch (err) {
      setError('Không thể xóa đánh giá. Vui lòng thử lại.');
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

  // Lấy user hiện tại từ localStorage (hoặc context nếu có)
  function getCurrentUserId() {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        // Đảm bảo đúng trường id
        return user.MaNguoiDung || user.userId || user.id || 1;
      }
    } catch {}
    return 1;
  }
  const currentUserId = getCurrentUserId();

  // Lấy role để phân quyền sửa/xóa
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

  // Phân quyền: chỉ người gửi feedback (chính chủ) mới được sửa/xóa feedback của mình
  // Riêng feedback ẩn danh: admin hoặc người đã gửi feedback ẩn danh đó (dựa vào localStorage)
  const canEditFeedback = (feedback: FeedbackItem) => {
    const userRole = getUserRole();
    if (feedback.AnDanh) {
      if (userRole === 'admin' || userRole === 'giangvien') return true;
      // Thử kiểm tra cả sessionStorage nếu localStorage bị xóa
      let myAnonIds: number[] = [];
      try {
        myAnonIds = JSON.parse(localStorage.getItem('my_anonymous_feedbacks') || '[]');
      } catch { myAnonIds = []; }
      if (!Array.isArray(myAnonIds) || myAnonIds.length === 0) {
        try {
          myAnonIds = JSON.parse(sessionStorage.getItem('my_anonymous_feedbacks') || '[]');
        } catch { myAnonIds = []; }
      }
      myAnonIds = myAnonIds.map(Number);
      return myAnonIds.includes(Number(feedback.MaDanhGia));
    }
    return String(feedback.NguoiGui) === String(currentUserId);
  };

  // Tìm kiếm đánh giá theo nội dung hoặc tên người gửi
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) {
      await loadRecentFeedbacks();
      return;
    }
    setSearching(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE}/api/danhgia/search`, {
        params: { q: search.trim() }
      });
      if (response.data && Array.isArray(response.data)) {
        const recentData = response.data
          .map((f: any) => ({
            MaDanhGia: f.MaDanhGia,
            TenCanSu: f.TenCanSu || '',
            TieuChi: f.TieuChi || '',
            NoiDung: f.NoiDung || '',
            TenNguoiGui: f.TenNguoiGui || 'Ẩn danh',
            NgayGui: f.NgayGui || '',
            MucLabel: f.MucLabel || '',
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
    } catch (err) {
      setError('Không tìm thấy đánh giá phù hợp.');
      setRecentFeedbacks([]);
      setFeedbackStats({ total: 0, avgRating: 0 });
    }
    setSearching(false);
  };

  return (
    <div className="feedback-page">
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <h1>Đánh giá cán sự lớp</h1>
          <p>Đóng góp ý kiến để cải thiện hoạt động lớp</p>
        </div>

        {/* Thanh tìm kiếm đánh giá */}
        <form
          onSubmit={handleSearch}
          style={{ display: 'flex', gap: 10, maxWidth: 400, margin: '0 auto 18px auto' }}
        >
          <input
            type="text"
            placeholder="Tìm kiếm theo nội dung hoặc tên người gửi..."
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
            disabled={dataLoading || searching}
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
            disabled={dataLoading || searching}
          >
            <i className="fas fa-search"></i> Tìm kiếm
          </button>
          {(search || searching) && (
            <button
              type="button"
              className="action-btn"
              style={{
                background: '#f3f4f6',
                color: '#374151',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: '1rem',
                padding: '8px 12px',
                border: 'none'
              }}
              onClick={() => {
                setSearch('');
                loadRecentFeedbacks();
              }}
              disabled={dataLoading || searching}
              title="Hủy tìm kiếm"
            >
              Hủy
            </button>
          )}
        </form>

        <div className="content-grid">
          {/* Form Section */}
          <div className="form-section">
            <div className="form-card">
              <h2>{editingFeedback ? "Sửa đánh giá" : "Gửi đánh giá"}</h2>
              {msg && <div className="message success">{msg}</div>}
              {error && <div className="message error">{error}</div>}

              {/* Form thêm mới hoặc sửa */}
              <form onSubmit={editingFeedback ? handleUpdateFeedback : handleSubmit}>
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
                {anonymous && (
                  <div style={{ color: '#d97706', background: '#fffbe7', border: '1px solid #fde68a', borderRadius: 6, padding: '8px 12px', marginBottom: 12, fontSize: '0.98rem' }}>
                    <b>Lưu ý:</b> Khi đăng ẩn danh, <b>chỉ có admin và giảng viên</b> được quyền sửa hoặc xóa đánh giá này.
                  </div>
                )}

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
                      <div className="rating-value" style={{ color: getCurrentCriteria().color }}>
                        <span className="score">{criteria}</span>
                        <span className="stars">{'★'.repeat(criteria)}{'☆'.repeat(5 - criteria)}</span>
                      </div>
                      <div className="rating-text">
                        <strong>{getCurrentCriteria().text}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Nhận xét <span className="optional">(tùy chọn)</span></label>
                  <textarea
                    placeholder={`Nhận xét về mức độ "${getCurrentCriteria().text}" của cán sự...`}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows={3}
                    disabled={officers.length === 0}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={loading || officers.length === 0}
                    style={{ backgroundColor: loading ? '#9ca3af' : getCurrentCriteria().color }}
                  >
                    {loading
                      ? 'Đang lưu...'
                      : editingFeedback
                        ? 'Lưu cập nhật'
                        : `Gửi đánh giá "${getCurrentCriteria().text}"`}
                  </button>
                  {editingFeedback && (
                    <button
                      type="button"
                      className="submit-btn"
                      style={{ background: '#d32f2f' }}
                      onClick={() => {
                        setEditingFeedback(null);
                        setSelectedOfficer('');
                        setCriteria(3);
                        setComment('');
                        setAnonymous(false);
                        setError(null);
                        setMsg(null);
                      }}
                    >
                      Hủy
                    </button>
                  )}
                </div>
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
                    // Chỉ hiện nút sửa/xóa nếu đúng quyền hoặc là chính chủ feedback
                    if (!canEditFeedback(feedback)) {
                      return (
                        <div key={feedback.MaDanhGia} className="feedback-item">
                          {/* ...existing code for feedback display, không có nút sửa/xóa... */}
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
                          </div>
                          {feedback.NoiDung && (
                            <div className="feedback-content">
                              "{feedback.NoiDung}"
                            </div>
                          )}
                          <div className="feedback-bottom">
                            <span className="author">
                              {feedback.TenNguoiGui === 'Ẩn danh'
                                ? <>Người gửi: <b>Ẩn danh</b></>
                                : <>Người gửi: <b>{feedback.TenNguoiGui}</b></>
                              }
                            </span>
                            <span className="time">{getTimeAgo(feedback.NgayGui)}</span>
                            <span className="date" style={{ marginLeft: 8, color: '#64748b', fontSize: '0.95em' }}>
                              {feedback.NgayGui ? new Date(feedback.NgayGui).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : ''}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    // Có quyền thì hiện nút sửa/xóa
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
                          <button
                            className="delete-feedback-btn"
                            title="Sửa đánh giá"
                            style={{
                              marginLeft: 8,
                              background: 'none',
                              border: 'none',
                              color: '#2563eb',
                              cursor: 'pointer',
                              fontSize: '1.1em'
                            }}
                            onClick={() => handleEditFeedback(feedback)}
                          >
                            ✏️
                          </button>
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
                        </div>
                        {feedback.NoiDung && (
                          <div className="feedback-content">
                            "{feedback.NoiDung}"
                          </div>
                        )}
                        <div className="feedback-bottom">
                          <span className="author">
                            {feedback.TenNguoiGui === 'Ẩn danh'
                              ? <>Người gửi: <b>Ẩn danh</b></>
                              : <>Người gửi: <b>{feedback.TenNguoiGui}</b></>
                            }
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

              {recentFeedbacks.length > 0 && (userRole === 'admin' || userRole === 'giangvien') && (
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