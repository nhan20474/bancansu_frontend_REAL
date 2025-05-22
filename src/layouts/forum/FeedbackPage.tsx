/**
 * FeedbackPage: Allows users to submit feedback about officers or the system.
 */
import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosConfig';
import '../user/login.css';

const feedbackTypes = [
  { key: 'officer', label: 'Đánh giá cán sự' },
  { key: 'system', label: 'Đánh giá hệ thống' },
  { key: 'suggestion', label: 'Đề xuất cải tiến chung' },
];

const feedbackCriteria = [
  { key: 'responsibility', label: 'Trách nhiệm' },
  { key: 'attitude', label: 'Thái độ làm việc' },
  { key: 'support', label: 'Khả năng hỗ trợ người khác' },
  { key: 'fairness', label: 'Tính công bằng' },
  { key: 'communication', label: 'Khả năng giao tiếp' },
];

const FeedbackPage: React.FC = () => {
  const [feedbackType, setFeedbackType] = useState('officer');
  const [people, setPeople] = useState<{ id: string; name: string; role: string }[]>([]);
  const [selectedPerson, setSelectedPerson] = useState('');
  const [criteria, setCriteria] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');
  const [anonymous, setAnonymous] = useState(true);
  const [average, setAverage] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (feedbackType === 'officer') {
      axios.get('/api/officers')
        .then(res => setPeople(res.data))
        .catch(() => setPeople([]));
    }
  }, [feedbackType]);

  useEffect(() => {
    const values = Object.values(criteria);
    if (values.length === feedbackCriteria.length) {
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      setAverage(parseFloat(avg.toFixed(1)));
    } else {
      setAverage(null);
    }
  }, [criteria]);

  const handleCriteriaChange = (key: string, value: number) => {
    setCriteria(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setError(null);

    if (feedbackType === 'officer') {
      if (!selectedPerson) {
        setError('Vui lòng chọn người để đánh giá.');
        return;
      }
      if (Object.keys(criteria).length !== feedbackCriteria.length) {
        setError('Vui lòng đánh giá đầy đủ các tiêu chí.');
        return;
      }
    } else if (!comment.trim()) {
      setError('Vui lòng nhập nội dung góp ý.');
      return;
    }

    const confirm = window.confirm('Bạn chắc chắn muốn gửi đánh giá này?');
    if (!confirm) return;

    setLoading(true);
    try {
      await axios.post('/api/feedback', {
        type: feedbackType,
        targetId: feedbackType === 'officer' ? selectedPerson : null,
        criteria: feedbackType === 'officer' ? criteria : null,
        comment,
        anonymous,
      });
      setMsg('🎉 Gửi phản hồi thành công! Cảm ơn bạn đã đóng góp.');
      setSelectedPerson('');
      setCriteria({});
      setComment('');
      setAverage(null);
      setAnonymous(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gửi phản hồi thất bại.');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit} style={{ maxWidth: 580 }}>
        <h2>📮 Góp ý & Phản hồi</h2>
        <p style={{ marginBottom: '1rem', color: '#374151' }}>
          Hãy để lại góp ý của bạn với hệ thống, cán sự hoặc đề xuất cải tiến.
        </p>

        {msg && <div className="form-success">{msg}</div>}
        {error && <div className="form-error">{error}</div>}

        <div className="form-group">
          <label>Loại phản hồi</label>
          <select
            className="form-input"
            value={feedbackType}
            onChange={e => setFeedbackType(e.target.value)}
          >
            {feedbackTypes.map(t => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>
        </div>

        {feedbackType === 'officer' && (
          <>
            <div className="form-group">
              <label>Chọn cán sự</label>
              <select
                className="form-input"
                value={selectedPerson}
                onChange={e => setSelectedPerson(e.target.value)}
                required
              >
                <option value="">-- Chọn --</option>
                {people.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.role})
                  </option>
                ))}
              </select>
            </div>

            {feedbackCriteria.map(c => (
              <div className="form-group" key={c.key}>
                <label>{c.label}</label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map(val => (
                    <label key={val} style={{ cursor: 'pointer', fontWeight: 500 }}>
                      <input
                        type="radio"
                        name={c.key}
                        value={val}
                        checked={criteria[c.key] === val}
                        onChange={() => handleCriteriaChange(c.key, val)}
                        required
                      />{' '}
                      {val}
                    </label>
                  ))}
                  <span style={{ marginLeft: 8, color: '#888', fontSize: 13 }}>(1: Kém, 5: Xuất sắc)</span>
                </div>
              </div>
            ))}

            {average !== null && (
              <div className="form-group">
                <strong>🎯 Điểm trung bình: {average} / 5</strong>
              </div>
            )}
          </>
        )}

        <div className="form-group">
          <label>Nội dung góp ý</label>
          <textarea
            className="form-input"
            rows={4}
            placeholder="Nhập góp ý hoặc phản ánh..."
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={anonymous}
              onChange={e => setAnonymous(e.target.checked)}
            />{' '}
            Gửi phản hồi ẩn danh
          </label>
        </div>

        <button type="submit" className="form-btn" disabled={loading}>
          {loading ? 'Đang gửi...' : 'Gửi phản hồi'}
        </button>
      </form>
    </div>
  );
};

export default FeedbackPage;