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
    <div className="homepage hutech-homepage-bg">
      <div className="hutech-header" style={{ marginTop: 32 }}>
        <img
          src="https://hutech.edu.vn/images/logo.png"
          alt="HUTECH Logo"
          className="hutech-logo"
          style={{ height: 80, marginRight: 24 }}
        />
        <div className="hutech-header-text">
          <div className="hutech-title" style={{ fontWeight: 700, fontSize: 22 }}>
            TRƯỜNG ĐẠI HỌC CÔNG NGHỆ TP.HCM (HUTECH)
          </div>
          <div className="hutech-slogan" style={{ color: '#2563eb', fontSize: 18 }}>
            Hệ thống quản lý cán sự lớp
          </div>
        </div>
      </div>

      <div className="homepage-carousel-container">
        <div id="demo" className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-indicators">
            <button type="button" data-bs-target="#demo" data-bs-slide-to="0" className="active"></button>
            <button type="button" data-bs-target="#demo" data-bs-slide-to="1"></button>
            <button type="button" data-bs-target="#demo" data-bs-slide-to="2"></button>
          </div>
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img src="https://file1.hutech.edu.vn/file/slider/9694691736999828.jpg" alt="Slide 1" className="d-block w-100" />
            </div>
            <div className="carousel-item">
              <img src="https://file1.hutech.edu.vn/file/slider/7968111696498843.jpg" alt="Slide 2" className="d-block w-100" />
            </div>
            <div className="carousel-item">
              <img src="https://file1.hutech.edu.vn/file/slider/8742621741055887.jpg" alt="Slide 3" className="d-block w-100" />
            </div>
          </div>
          <button className="carousel-control-prev" type="button" data-bs-target="#demo" data-bs-slide="prev">
            <span className="carousel-control-prev-icon"></span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#demo" data-bs-slide="next">
            <span className="carousel-control-next-icon"></span>
          </button>
        </div>
      </div>

      <div className="homepage-content">
        <h1>Chào mừng bạn đến với hệ thống quản lý cán sự lớp HUTECH</h1>
        <p>
          Đây là nền tảng hỗ trợ quản lý cán sự, lớp học, sinh viên và thông báo một cách hiện đại, trực quan và dễ sử dụng.<br />
          Hệ thống hướng tới việc đơn giản hóa công tác quản lý, nâng cao hiệu quả phối hợp giữa nhà trường, giảng viên và sinh viên.
        </p>
      </div>
    </div>
  );
};

export default HomePage;
