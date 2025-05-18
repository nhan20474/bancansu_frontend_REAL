// File: HomePage.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Homepage.css';

const API_BASE = 'http://localhost:8080';

const HomePage = () => {
  const [classCount, setClassCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [cansuCount, setCansuCount] = useState(0);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get(`${API_BASE}/lop/count`),
      axios.get(`${API_BASE}/sinhvien/count`),
      axios.get(`${API_BASE}/cansu/count`),
      axios.get(`${API_BASE}/thongbao/latest?limit=3`)
    ])
      .then(([lopRes, svRes, csRes, tbRes]) => {
        setClassCount(lopRes.data.count || 0);
        setStudentCount(svRes.data.count || 0);
        setCansuCount(csRes.data.count || 0);
        setNotifications(Array.isArray(tbRes.data) ? tbRes.data.map(tb => tb.TieuDe) : []);
      })
      .catch(() => {
        setClassCount(0);
        setStudentCount(0);
        setCansuCount(0);
        setNotifications([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="homepage-container">
      <div className="welcome-text">
        Chào mừng bạn đến với hệ thống quản lý lớp học BCS!
      </div>
      <div className="grid-layout">
        <div className="card">
          <h4>Tổng số lớp</h4>
          <div className="count">{loading ? '...' : classCount}</div>
          <a href="/classes">Xem chi tiết</a>
        </div>
        <div className="card">
          <h4>Tổng số sinh viên</h4>
          <div className="count">{loading ? '...' : studentCount}</div>
          <a href="/students">Xem chi tiết</a>
        </div>
        <div className="card">
          <h4>Cán sự</h4>
          <div className="count">{loading ? '...' : cansuCount}</div>
          <a href="/cansu">Xem chi tiết</a>
        </div>
        <div className="card notify">
          <h4>Thông báo mới</h4>
          <ul>
            {loading
              ? <li>Đang tải...</li>
              : notifications.length === 0
                ? <li>Không có thông báo mới</li>
                : notifications.map((item, idx) => <li key={idx}>{item}</li>)
            }
          </ul>
          <a href="/notifications">Xem tất cả</a>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
