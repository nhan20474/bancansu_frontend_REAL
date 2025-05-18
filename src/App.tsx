import React from 'react';
import { Switch, Route, Redirect, useLocation } from 'react-router-dom';
import Navbar from './layouts/components/Navbar';
import Sidebar from './layouts/components/Sidebar';
import Footer from './layouts/components/Footer';
import Homepage from './layouts/homepage/Homepage';
import Login from './layouts/user/login';
import Help from './layouts/documents/Help';
import About from './layouts/documents/About';
import Downloads from './layouts/documents/Downloads';
import Textbooks from './layouts/documents/Textbooks';
import Discussion from './layouts/forum/Discussion';
import ProfilePage from './layouts/profilepage/ProfilePage';
import ClassList from './layouts/classes/ClassList';
import StudentList from './layouts/students/StudentList';
import CanSuList from './layouts/cansu/CanSuList';
import NotificationList from './layouts/notifications/NotificationList';
import { UserProvider, useUser } from './contexts/UserContext';
import './App.css';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [dropdowns, setDropdowns] = React.useState({
    docs: false,
    forum: false,
    survey: false,
    hutech: false,
    other: false,
  });

  const { user } = useUser();
  const location = useLocation();

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
          />
        )}
        <div className="main-body">
          <Switch>
            <Route exact path="/">
              {!user ? <Redirect to="/login" /> : <Homepage />}
            </Route>
            <Route path="/login" component={Login} />
            <Route path="/help" component={Help} />
            <Route path="/about" component={About} />
            <Route path="/downloads" component={Downloads} />
            <Route path="/textbooks" component={Textbooks} />
            <Route path="/discussion" component={Discussion} />
            <Route path="/profilepage" component={ProfilePage} />
            <Route path="/classes" component={ClassList} />
            <Route path="/students" component={StudentList} />
            <Route path="/cansu" component={CanSuList} />
            <Route path="/notifications" component={NotificationList} />
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
    </UserProvider>
  );
}

export default App;
