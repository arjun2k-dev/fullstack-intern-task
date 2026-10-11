import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CloseIcon, LogoMark, MenuIcon } from './icons';

const linkClass =
  (extra = '') =>
  ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${extra} ${
      isActive
        ? 'bg-indigo-50 text-indigo-700'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    closeMenu();
    // Navigate first so the route guard never captures /favorites as a "return to" page
    navigate('/login', { replace: true });
    logout();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <div className="flex items-center gap-8">
          <Link
            to="/templates"
            onClick={closeMenu}
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900"
          >
            <LogoMark />
            <span>TemplateStore</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <NavLink to="/templates" className={linkClass()}>
              Templates
            </NavLink>
            <NavLink to="/favorites" className={linkClass()}>
              Favorites
            </NavLink>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <div className="flex items-center gap-2.5">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700"
                  aria-hidden="true"
                >
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[10rem] truncate text-sm font-medium text-slate-700">
                  {user.name}
                </span>
              </div>
              <button type="button" onClick={handleLogout} className="btn-secondary">
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass()}>
                Log in
              </NavLink>
              <Link to="/register" className="btn-primary">
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </nav>

      {menuOpen && (
        <div className="space-y-1 border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <NavLink to="/templates" onClick={closeMenu} className={linkClass('block')}>
            Templates
          </NavLink>
          <NavLink to="/favorites" onClick={closeMenu} className={linkClass('block')}>
            Favorites
          </NavLink>

          <div className="mt-2 border-t border-slate-100 pt-3">
            {user ? (
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-sm font-medium text-slate-700">{user.name}</span>
                <button type="button" onClick={handleLogout} className="btn-secondary">
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" onClick={closeMenu} className="btn-secondary flex-1">
                  Log in
                </Link>
                <Link to="/register" onClick={closeMenu} className="btn-primary flex-1">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
