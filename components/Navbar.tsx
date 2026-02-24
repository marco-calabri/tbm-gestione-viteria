
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { LayoutDashboard, Settings2, History, LogOut, ShieldAlert, Menu, X } from 'lucide-react';
import { UserRole } from '../types';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [];

  if (user?.role === UserRole.ADMIN) {
    navLinks.push(
      { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
      { path: '/configurator', label: 'Nuovo Calcolo', icon: <Settings2 size={20} /> },
      { path: '/history', label: 'Storico', icon: <History size={20} /> },
      { path: '/admin', label: 'Admin', icon: <ShieldAlert size={20} /> }
    );
  } else {
    navLinks.push(
      { path: '/configurator', label: 'Elaborazione Progetto', icon: <Settings2 size={20} /> }
    );
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link to={user?.role === UserRole.ADMIN ? "/" : "/configurator"} className="text-xl font-bold text-blue-600 tracking-tight flex items-center gap-2">
              <div className="bg-blue-600 text-white p-1 rounded">TBM</div>
              <span>Gestione Viteria</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive(link.path)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 border-l pl-6 border-slate-200">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900 leading-none">{user?.displayName}</p>
              <p className="text-xs text-slate-500">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              title="Esci"
            >
              <LogOut size={20} />
            </button>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${isActive(link.path) ? 'bg-blue-50 text-blue-700' : 'text-slate-600'
                }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut size={20} />
            Esci
          </button>
        </div>
      )}
    </nav>
  );
};
