// src/pages/Download.tsx
import React from 'react';
import './Downloads.css';

interface FileItem {
  id: number;
  name: string;
  description: string;
  fileUrl: string;
}

const mockFiles: FileItem[] = [
  {
    id: 1,
    name: 'Bài giảng Cơ sở dữ liệu',
    description: 'File PDF tổng hợp bài giảng tuần 1-4.',
    fileUrl: '/files/csdl_baigiang.pdf',
  },
  {
    id: 2,
    name: 'Đề cương môn Mạng máy tính',
    description: 'Tài liệu chuẩn bị cho kỳ thi giữa kỳ.',
    fileUrl: '/files/decuong_mmt.pdf',
  },
  {
    id: 3,
    name: 'Slide bài giảng Lập trình Web',
    description: 'File trình chiếu tuần 5-6.',
    fileUrl: '/files/laptrinhweb_slide.pptx',
  },
];

const Download: React.FC = () => {
  return (
    <div className="download-container">
      <h1>Tài liệu tải về</h1>
      <ul className="download-list">
        {mockFiles.map(file => (
          <li key={file.id} className="download-item">
            <div className="file-info">
              <h3>{file.name}</h3>
              <p>{file.description}</p>
            </div>
            <a href={file.fileUrl} download className="download-btn">
              <i className="fas fa-download"></i> Tải về
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Download;
