import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './layouts/pagelayouts/Navbar';
import Sidebar from './layouts/pagelayouts/Sidebar';
import Footer from './layouts/pagelayouts/Footer';
import Homepage from './layouts/homepage/Homepage';
import Login from './layouts/pages/Login';
import Help from './layouts/documents/Help';
import About from './layouts/documents/About';
import Downloads from './layouts/documents/Downloads';
import Textbooks from './layouts/documents/Textbooks';
import Discussion from './layouts/forum/Discussion';
import { UserProvider } from './contexts/UserContext';
import './App.css'; // chứa layout CSS chung

function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [dropdowns, setDropdowns] = React.useState({
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
    <UserProvider>
      <div className="app-wrapper">
        <Sidebar
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          dropdowns={dropdowns}
          toggleDropdown={toggleDropdown}
        />

        <div className="main-content">
          <Navbar
            toggleSidebar={toggleSidebar}
            toggleFullscreen={toggleFullscreen}
          />

          <div className="main-body">
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/help" element={<Help />} />
              <Route path="/about" element={<About />} />
              <Route path="/downloads" element={<Downloads />} />
              <Route path="/textbooks" element={<Textbooks />} />
              <Route path="/discussion" element={<Discussion />} />
              {/* Thêm các route khác tại đây */}
            </Routes>
          </div>

          <Footer />
        </div>
      </div>
    </UserProvider>
  );
}

export default App;
