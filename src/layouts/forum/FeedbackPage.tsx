/**
 * FeedbackPage: Allows users to submit feedback about officers or the system.
 */
import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosConfig';
import '../user/login.css';

const feedbackCriteria = [
  { key: 'Nhiệt tình', label: 'Nhiệt tình' },
  { key: 'Chăm chỉ', label: 'Chăm chỉ' },
  { key: 'Trách nhiệm', label: 'Trách nhiệm' },
  { key: 'Thái độ', label: 'Thái độ' },
  { key: 'Hỗ trợ', label: 'Hỗ trợ' },
];

const FeedbackPage: React.FC = () => {
  const [people, setPeople] = useState<{ id: string; name: string; role: string }[]>([]);
  const [selectedPerson, setSelectedPerson] = useState('');
  const [selectedCriterion, setSelectedCriterion] = useState('');
  const [comment, setComment] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  useEffect(() => {
    axios.get('/officers')
      .then(res => setPeople(res.data))
      .catch(() => setPeople([]));
    // Lấy danh sách đánh giá
    axios.get('/danhgia')
      .then(res => setFeedbacks(res.data))
      .catch(() => setFeedbacks([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setError(null);

    if (!selectedPerson) {
      setError('Vui lòng chọn cán sự để đánh giá.');
      return;
    }
    if (!selectedCriterion) {
      setError('Vui lòng chọn tiêu chí đánh giá.');
      return;
    }
    if (!comment.trim()) {
      setError('Vui lòng nhập nội dung góp ý.');
      return;
    }

    const confirm = window.confirm('Bạn chắc chắn muốn gửi đánh giá này?');
    if (!confirm) return;

    setLoading(true);
    try {
      await axios.post('/danhgia', {
        CanSuDuocDanhGia: selectedPerson,
        TieuChi: selectedCriterion,
        NoiDung: comment,
      });
      setMsg('🎉 Gửi đánh giá thành công! Cảm ơn bạn đã đóng góp.');
      setSelectedPerson('');
      setSelectedCriterion('');
      setComment('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gửi đánh giá thất bại.');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="feedback-wrapper" style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 40, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Form đánh giá */}
        <form className="login-form" onSubmit={handleSubmit} style={{ maxWidth: 420, flex: 1 }}>
          <h2 style={{ textAlign: 'center' }}>📮 Đánh giá cán sự</h2>
          <p style={{ marginBottom: '1rem', color: '#374151', textAlign: 'center' }}>
            Hãy để lại đánh giá của bạn cho cán sự lớp.
          </p>

          {msg && <div className="form-success">{msg}</div>}
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label>Chọn cán sự</label>
            <select
              className="form-input"
              value={selectedPerson}
              onChange={e => setSelectedPerson(e.target.value)}
              required
            >
              <option value="">-- Chọn --</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.role})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Chọn tiêu chí</label>
            <select
              className="form-input"
              value={selectedCriterion}
              onChange={e => setSelectedCriterion(e.target.value)}
              required
            >
              <option value="">-- Chọn --</option>
              {feedbackCriteria.map((c, idx) => (
                <option key={c.key || idx} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Nội dung góp ý</label>
            <textarea
              className="form-input"
              rows={4}
              placeholder="Nhập góp ý hoặc phản ánh..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              required
              style={{ resize: 'vertical' }}
            />
          </div>

          <button type="submit" className="form-btn" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </form>

        {/* Danh sách đánh giá */}
        <div className="feedback-list" style={{ flex: 2, minWidth: 320 }}>
          <h3 style={{ marginBottom: 16, textAlign: 'center' }}>📝 Danh sách đánh giá đã gửi</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="reports-table" style={{ width: '100%', minWidth: 700, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Mã đánh giá</th>
                  <th>Mã người gửi</th>
                  <th>Mã cán sự</th>
                  <th>Tiêu chí</th>
                  <th>Nội dung</th>
                  <th>Ngày gửi</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center' }}>Không có dữ liệu</td>
                  </tr>
                ) : (
                  feedbacks.map((fb, idx) => (
                    <tr key={fb.MaDanhGia}>
                      <td>{idx + 1}</td>
                      <td>{fb.MaDanhGia}</td>
                      <td>{fb.NguoiGui}</td>
                      <td>{fb.CanSuDuocDanhGia}</td>
                      <td>{fb.TieuChi}</td>
                      <td>{fb.NoiDung}</td>
                      <td>{new Date(fb.NgayGui).toLocaleString('vi-VN')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;