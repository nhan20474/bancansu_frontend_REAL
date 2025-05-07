import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import './Downloads.css';

interface DownloadRecord {
  id: number;
  title: string;
  file_url: string;
  downloaded_at: string;
}

const Downloads: React.FC = () => {
  const [list, setList] = useState<DownloadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  const fetchList = () => {
    axios.get<DownloadRecord[]>('/api/downloads.php')
      .then((res: AxiosResponse<DownloadRecord[]>) => setList(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(fetchList, []);

  const remove = (id: number) => {
    axios.delete(`/api/downloads.php?id=${id}`)
      .then(() => setList(list.filter(item => item.id !== id)))
      .catch(err => alert('Xóa thất bại: ' + err.message));
  };

  if (loading) return <div className="downloads-page">Đang tải lịch sử…</div>;
  if (error)   return <div className="downloads-page error">Lỗi: {error}</div>;

  return (
    <div className="downloads-page">
      <h2>Tài liệu đã tải về</h2>
      <ul className="downloads-list">
        {list.map(d => (
          <li key={d.id} className="download-item">
            <div>
              <p className="dl-title">{d.title}</p>
              <p className="dl-date">{new Date(d.downloaded_at).toLocaleString()}</p>
            </div>
            <div className="dl-actions">
              <a href={d.file_url} download className="download-btn">Tải lại</a>
              <button onClick={() => remove(d.id)} className="remove-btn">Xóa</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Downloads;
