// src/layouts/documents/About.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './About.css';  // tạo file CSS nếu cần

const About: React.FC = () => {
  const [page, setPage] = useState<{ title: string; content: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios.get('/api/pages.php?page=about')
      .then(res => setPage(res.data))
      .catch(err => setError(err.response?.data?.error || err.message));
  }, []);

  if (error) return <div className="page error">Lỗi: {error}</div>;
  if (!page) return <div className="page loading">Đang tải giới thiệu…</div>;

  return (
    <div className="page about-page">
      <h1>{page.title}</h1>
      <div 
        className="page-content" 
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
};

export default About;
