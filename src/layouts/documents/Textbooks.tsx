// src/pages/Textbook.tsx
import React, { useState, useMemo } from 'react';
import './Textbooks.css';

interface Textbook {
  id: number;
  title: string;
  subject: string;
  author: string;
  fileUrl: string;
}

const mockTextbooks: Textbook[] = [
  {
    id: 1,
    title: 'Cơ sở dữ liệu căn bản',
    subject: 'Cơ sở dữ liệu',
    author: 'Nguyễn Văn A',
    fileUrl: '/files/csdl.pdf',
  },
  {
    id: 2,
    title: 'Lập trình Web nâng cao',
    subject: 'Lập trình',
    author: 'Trần Thị B',
    fileUrl: '/files/webdev.pdf',
  },
  {
    id: 3,
    title: 'Mạng máy tính',
    subject: 'Mạng',
    author: 'Lê Văn C',
    fileUrl: '/files/mmt.pdf',
  },
];

const Textbook: React.FC = () => {
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  const subjects = useMemo(() => {
    return Array.from(new Set(mockTextbooks.map(tb => tb.subject)));
  }, []);

  const filteredTextbooks = useMemo(() => {
    return mockTextbooks
      .filter(tb => tb.title.toLowerCase().includes(search.toLowerCase()))
      .filter(tb => !subjectFilter || tb.subject === subjectFilter);
  }, [search, subjectFilter]);

  return (
    <div className="textbook-container">
      <h1>Giáo trình học tập</h1>

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
          <option value="">Tất cả môn học</option>
          {subjects.map(subject => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
      </div>

      <ul className="textbook-list">
        {filteredTextbooks.map(tb => (
          <li key={tb.id} className="textbook-item">
            <div>
              <h3>{tb.title}</h3>
              <p><strong>Môn học:</strong> {tb.subject}</p>
              <p><strong>Tác giả:</strong> {tb.author}</p>
            </div>
            <a href={tb.fileUrl} download className="download-btn">
              <i className="fas fa-download"></i> Tải xuống
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Textbook;
