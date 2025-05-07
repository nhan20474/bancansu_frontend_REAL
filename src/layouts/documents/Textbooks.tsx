import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './Textbooks.css';

interface Textbook {
  id: number;
  title: string;
  author?: string;
  subject?: string;
  file_url: string;
}

const API_BASE = 'http://localhost:8080/bcsproject_backend/app/public/api';

const Textbooks: React.FC = () => {
  const [books, setBooks] = useState<Textbook[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dữ liệu từ API
  const fetchTextbooks = async () => {
    setLoading(true);
    try {
      const res = await axios.get<Textbook[]>(`${API_BASE}/textbooks.php`);
      console.log('API trả về:', res.data);

      // Kiểm tra định dạng dữ liệu
      if (!Array.isArray(res.data)) {
        console.error('API trả về không phải mảng:', res.data);
        setError('Dữ liệu giáo trình không hợp lệ');
        return;
      }

      const data = res.data;
      setBooks(data);

      // Tạo danh sách môn học duy nhất
      const uniq = Array.from(
        new Set(
          data.map(b => b.subject).filter((s): s is string => !!s)
        )
      );
      setSubjects(uniq);
    } catch (err: any) {
      console.error('Lỗi khi fetch giáo trình:', err.response || err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTextbooks();
  }, []);

  // Tính filtered array
  const filtered = useMemo(() => {
    const source = Array.isArray(books) ? books : [];
    return source
      .filter(b => !search || b.title.toLowerCase().includes(search.toLowerCase()))
      .filter(b => !subjectFilter || b.subject === subjectFilter);
  }, [books, search, subjectFilter]);

  if (loading) return <div className="textbooks-page">Đang tải giáo trình…</div>;
  if (error) return <div className="textbooks-page error">Lỗi: {error}</div>;

  return (
    <div className="textbooks-page">
      <h2>Giáo trình</h2>
      <div className="filters">
        <input
          type="text"
          placeholder="Tìm kiếm tiêu đề…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          value={subjectFilter}
          onChange={e => setSubjectFilter(e.target.value)}
        >
          <option value="">Tất cả môn</option>
          {subjects.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="no-results">Không tìm thấy giáo trình nào.</p>
      ) : (
        <ul className="textbook-list">
          {filtered.map(b => (
            <li key={b.id} className="textbook-item">
              <div>
                <p className="book-title">{b.title}</p>
                {b.author && <p className="book-author">Tác giả: {b.author}</p>}
                {b.subject && <p className="book-subject">Môn: {b.subject}</p>}
              </div>
              <a href={b.file_url} download className="download-btn">
                Tải về
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Textbooks;
