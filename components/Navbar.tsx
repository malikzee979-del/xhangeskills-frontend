'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [avatar, setAvatar] = useState('');

  // Update display name and avatar from user or localStorage
  useEffect(() => {
    
    if (user?.displayName) {
      setDisplayName(user.displayName);
    } else if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('userDisplayName') || sessionStorage.getItem('userDisplayName');
      setDisplayName(storedName || user?.username || '');
    }

    if (user?.avatar) {
      setAvatar(user.avatar);
    } else if (typeof window !== 'undefined') {
      const storedAvatar = localStorage.getItem('userAvatar') || sessionStorage.getItem('userAvatar');
      setAvatar(storedAvatar || '');
    }
  }, [user]);

  // Listen for avatar updates from profile page
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleAvatarUpdate = (event: any) => {
      setAvatar(event.detail?.avatar || '');
    };

    window.addEventListener('avatarUpdated', handleAvatarUpdate);
    return () => window.removeEventListener('avatarUpdated', handleAvatarUpdate);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    logout();
    setIsDropdownOpen(false);
    router.push('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link href="/" className="navbar-brand">
            XchangeSkills
          </Link>
        </div>

        <div className="navbar-right">
          {isAuthenticated && user ? (
            <div className="profile-dropdown">
              <button
                className="profile-trigger"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {avatar && (
                  <img
                    src={avatar}
                    alt={displayName}
                    className="profile-avatar"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/default-avatar.png';
                    }}
                  />
                )}
                {!avatar && <div className="profile-avatar-placeholder">{displayName?.charAt(0) || 'U'}</div>}
                <span className="profile-name">{displayName || user.username}</span>
              </button>

              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <div className="header-name">{displayName || user.username}</div>
                    <div className="header-email">{user.email}</div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link href="/dashboard/profile" className="dropdown-item">
                    My Profile
                  </Link>
                  <Link href="/dashboard" className="dropdown-item">
                    Dashboard
                  </Link>
                  <Link href="/dashboard/skills" className="dropdown-item">
                    My Skills
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item logout-item">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link href="/login" className="btn-login">
                Login
              </Link>
              <Link href="/register" className="btn-register">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .navbar {
          background: white;
          border-bottom: 1px solid #e0e0e0;
          padding: 0 20px;
          sticky: top;
          z-index: 1000;
        }

        .navbar-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 60px;
        }

        .navbar-left {
          display: flex;
          align-items: center;
        }

        .navbar-brand {
          font-size: 20px;
          font-weight: bold;
          text-decoration: none;
          color: #333;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .profile-dropdown {
          position: relative;
        }

        .profile-trigger {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: 1px solid #ddd;
          border-radius: 20px;
          padding: 4px 12px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .profile-trigger:hover {
          background: #f5f5f5;
          border-color: #999;
        }

        .profile-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }

        .profile-avatar-placeholder {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #007bff;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
        }

        .profile-name {
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          min-width: 250px;
          margin-top: 8px;
          z-index: 1001;
        }

        .dropdown-header {
          padding: 12px 16px;
        }

        .header-name {
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }

        .header-email {
          font-size: 12px;
          color: #999;
          margin-top: 4px;
        }

        .dropdown-divider {
          height: 1px;
          background: #eee;
        }

        .dropdown-item {
          display: block;
          width: 100%;
          padding: 12px 16px;
          text-align: left;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          color: #333;
          text-decoration: none;
          transition: background 0.2s ease;
        }

        .dropdown-item:hover {
          background: #f5f5f5;
        }

        .logout-item {
          color: #dc3545;
          font-weight: 500;
        }

        .logout-item:hover {
          background: #fff5f5;
        }

        .auth-links {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .btn-login,
        .btn-register {
          padding: 8px 16px;
          border-radius: 4px;
          text-decoration: none;
          font-size: 14px;
          transition: all 0.3s ease;
          cursor: pointer;
          border: none;
        }

        .btn-login {
          color: #007bff;
          border: 1px solid #007bff;
          background: white;
        }

        .btn-login:hover {
          background: #007bff;
          color: white;
        }

        .btn-register {
          background: #007bff;
          color: white;
          border: 1px solid #007bff;
        }

        .btn-register:hover {
          background: #0056b3;
          border-color: #0056b3;
        }
      `}</style>
    </nav>
  );
}
