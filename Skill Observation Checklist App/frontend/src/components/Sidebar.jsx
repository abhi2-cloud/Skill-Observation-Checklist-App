import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  RiDashboardLine,
  RiTeamLine,
  RiNotification3Line,
  RiBarChartLine,
  RiHistoryLine,
  RiBookOpenLine,
  RiCalendarLine,
  RiLogoutBoxLine,
  RiMenuLine,
  RiCloseLine,
  RiHeartPulseLine,
  RiFilePaperLine,
  RiMailLine,
} from 'react-icons/ri';
import './Sidebar.css';

const navByRole = {
  admin: [
    { label: 'Dashboard',     path: '/dashboard',      icon: <RiDashboardLine /> },
    { label: 'Children',      path: '/children',       icon: <RiTeamLine /> },
    { label: 'Observations',  path: '/observations',   icon: <RiBookOpenLine /> },
    { label: 'Progress',      path: '/progress',       icon: <RiBarChartLine /> },
    { label: 'Reports',       path: '/reports',        icon: <RiFilePaperLine /> },
    { label: 'Monthly Reports', path: '/monthly-reports', icon: <RiCalendarLine /> },
    { label: 'Notifications', path: '/notifications',  icon: <RiNotification3Line /> },
    { label: 'Activity Logs', path: '/activity-logs',  icon: <RiHistoryLine /> },
    { label: 'Email Reports', path: '/email-reports',  icon: <RiMailLine /> },
  ],
  teacher: [
    { label: 'Dashboard',     path: '/dashboard',      icon: <RiDashboardLine /> },
    { label: 'Children',      path: '/children',       icon: <RiTeamLine /> },
    { label: 'Observations',  path: '/observations',   icon: <RiBookOpenLine /> },
    { label: 'Progress',      path: '/progress',       icon: <RiBarChartLine /> },
    { label: 'Reports',       path: '/reports',        icon: <RiFilePaperLine /> },
  ],
  parent: [
    { label: 'Dashboard',     path: '/dashboard',      icon: <RiDashboardLine /> },
    { label: 'My Child',      path: '/parent-portal',  icon: <RiHeartPulseLine /> },
    { label: 'Progress',      path: '/progress',       icon: <RiBarChartLine /> },
    { label: 'Reports',       path: '/reports',        icon: <RiFilePaperLine /> },
  ],
};

const roleColors = {
  admin:   { bg: '#EFF6FF', color: '#2563EB', label: 'Admin' },
  teacher: { bg: '#ECFDF5', color: '#059669', label: 'Teacher' },
  parent:  { bg: '#F5F3FF', color: '#7C3AED', label: 'Parent' },
};

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getAvatarColor(name = '') {
  const colors = ['#2563EB','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#06B6D4'];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

export default function Sidebar() {
  const location = useLocation();
  const navigate  = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role     = localStorage.getItem('user_role') || 'teacher';
  const userName = localStorage.getItem('user_name') || 'User';
  const userEmail= localStorage.getItem('user_email') || '';

  const navItems = navByRole[role] || navByRole.teacher;
  const roleStyle = roleColors[role] || roleColors.teacher;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ||
    (path !== '/dashboard' && location.pathname.startsWith(path));

  return (
    <>
      {/* Mobile toggle */}
      <button className="sidebar-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <RiCloseLine /> : <RiMenuLine />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-icon">
            <RiBookOpenLine />
          </div>
          <div className="brand-text">
            <span className="brand-name">SkillCheck</span>
            <span className="brand-sub">ERP</span>
          </div>
        </div>

        <div className="sidebar-divider" />

        {/* Navigation */}
        <nav className="sidebar-nav">
          <p className="nav-section-label">MAIN MENU</p>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {isActive(item.path) && <span className="nav-indicator" />}
            </Link>
          ))}
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        <div className="sidebar-divider" />

        {/* Profile */}
        <div className="sidebar-profile">
          <div
            className="profile-avatar"
            style={{ background: getAvatarColor(userName) }}
          >
            {getInitials(userName)}
          </div>
          <div className="profile-info">
            <p className="profile-name">{userName}</p>
            <span
              className="profile-role-badge"
              style={{ background: roleStyle.bg, color: roleStyle.color }}
            >
              {roleStyle.label}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button className="sidebar-logout" onClick={handleLogout}>
          <RiLogoutBoxLine />
          <span>Sign Out</span>
        </button>
      </aside>
    </>
  );
}