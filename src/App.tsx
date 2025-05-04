import React, { useState } from 'react';
import './App.css';
import Sidebar from './layouts/pagelayouts/Sidebar';
import Navbar from './layouts/pagelayouts/Navbar';
import Footer from './layouts/pagelayouts/Footer';
import Login from './layouts/user/login';
import HomePage from './layouts/homepage/Homepage';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdowns, setDropdowns] = useState({
    docs: false,
    forum: false,
    survey: false,
    hutech: false,
    other: false,
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const toggleDropdown = (key: keyof typeof dropdowns) => {
    setDropdowns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className={`app-wrapper ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <Navbar toggleSidebar={toggleSidebar} toggleFullscreen={toggleFullscreen} />
      <Sidebar
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        dropdowns={dropdowns}
        toggleDropdown={toggleDropdown}
      />
      <main className="main-content">
        <div className="main-header">
          <img src="/welcome.png" alt="Welcome" style={{ maxWidth: '300px' }} />
          <p>Chào mừng đến với cổng sinh viên HUTECH</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
