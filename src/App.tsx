import React, { useState } from 'react';
import { Switch, Route, Redirect, useLocation } from 'react-router-dom';
import Navbar from './layouts/components/Navbar';
import Sidebar from './layouts/components/Sidebar';
import Footer from './layouts/components/Footer';
import Homepage from './layouts/homepage/Homepage';
import Login from './layouts/user/login';
import Help from './layouts/documents/Help';
import About from './layouts/documents/About';
import FeedbackPage from './layouts/forum/FeedbackPage';
import ReportsPage from './layouts/reports/ReportsPage'; // Thêm dòng này
import ProfilePage from './layouts/profilepage/ProfilePage';
import ClassList from './layouts/classes/ClassList';
import StudentList from './layouts/students/StudentList';
import CanSuList from './layouts/cansu/CanSuList';
import NotificationList from './layouts/notifications/NotificationList';
import ForgotPassword from './layouts/user/ForgotPassword';
import ChangePassword from './layouts/user/ChangePasswordForm';
import TaskList from './layouts/tasks/TaskList';
import { UserProvider, useUser } from './contexts/UserContext';
import './App.css';
import BotChat from './layouts/components/BotChat';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [dropdowns, setDropdowns] = React.useState({
    hutech: false,
    other: false,
  });

  const { user } = useUser();
  const location = useLocation();
  const [notifications, setNotifications] = useState<any[]>([]); // hoặc kiểu phù hợp

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

  // Nếu đã đăng nhập mà vào /login thì chuyển về /
  if (user && location.pathname === '/login') {
    return <Redirect to="/" />;
  }

  return (
    <div className="app-wrapper">
      {user && (
        <Sidebar
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          dropdowns={dropdowns}
          toggleDropdown={toggleDropdown}
        />
      )}
      <div className="main-content">
        {user && (
          <Navbar
            toggleSidebar={toggleSidebar}
            toggleFullscreen={toggleFullscreen}
            notifications={notifications} // truyền prop notifications vào Navbar
          />
        )}
        <div className="main-body">
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/forgot-password" component={ForgotPassword} />
            <Route path="/change-password" component={ChangePassword} />
            {/* Các route dưới đây yêu cầu đăng nhập */}
            <Route exact path="/">
              {!user ? <Redirect to="/login" /> : <Homepage />}
            </Route>
            <Route path="/help" component={Help} />
            <Route path="/about" component={About} />
            <Route path="/feedback" component={FeedbackPage} />
            <Route path="/reports" component={ReportsPage} /> {/* Thêm dòng này */}
            <Route path="/profilepage" component={ProfilePage} />
            <Route path="/classes" component={ClassList} />
            <Route path="/students" component={StudentList} />
            <Route path="/cansu" component={CanSuList} />
            <Route path="/notifications" component={NotificationList} />
            <Route path="/tasks" component={TaskList} />
            {/* Thêm các route khác tại đây */}
          </Switch>
        </div>
        {user && <Footer />}
      </div>
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <AppContent />
      <BotChat />
    </UserProvider>
  );
}

export default App;
