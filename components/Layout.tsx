import React from 'react';
import { User, UserRole } from '../types';
import { 
  LayoutDashboard, 
  PlusCircle, 
  List, 
  Map as MapIcon, 
  LogOut, 
  Menu, 
  X, 
  Droplets
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [isSidebarOpen, setSidebarOpen] = React.useState(false);
  const navigate = useNavigate();

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) => (
    <NavLink
      to={to}
      onClick={() => setSidebarOpen(false)}
      className={({ isActive }) =>
        `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
        }`
      }
    >
      <Icon size={20} />
      <span>{label}</span>
    </NavLink>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-900 text-white shadow-xl z-20">
        <div className="p-6 flex items-center space-x-2 border-b border-gray-800">
          <Droplets className="text-blue-400" size={28} />
          <h1 className="text-xl font-bold tracking-tight">GeoTAG 360</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {user.role === UserRole.FIELD_WORKER && (
            <>
              <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
              <NavItem to="/new" icon={PlusCircle} label="New Connection" />
              <NavItem to="/submissions" icon={List} label="My Submissions" />
            </>
          )}
          {user.role === UserRole.ADMIN && (
            <>
              <NavItem to="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavItem to="/admin/submissions" icon={List} label="Submissions" />
              <NavItem to="/admin/map" icon={MapIcon} label="Map View" />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="mb-4 px-4">
            <p className="text-sm text-gray-400">Logged in as</p>
            <p className="font-medium truncate">{user.name}</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center space-x-3 px-4 py-2 w-full text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-gray-900 text-white flex flex-col shadow-xl">
            <div className="p-6 flex justify-between items-center border-b border-gray-800">
              <div className="flex items-center space-x-2">
                <Droplets className="text-blue-400" size={24} />
                <h1 className="text-lg font-bold">GeoTAG 360</h1>
              </div>
              <button onClick={() => setSidebarOpen(false)}>
                <X size={24} className="text-gray-400" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-2">
               {user.role === UserRole.FIELD_WORKER && (
                <>
                  <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
                  <NavItem to="/new" icon={PlusCircle} label="New Connection" />
                  <NavItem to="/submissions" icon={List} label="My Submissions" />
                </>
              )}
              {user.role === UserRole.ADMIN && (
                <>
                  <NavItem to="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" />
                  <NavItem to="/admin/submissions" icon={List} label="Submissions" />
                  <NavItem to="/admin/map" icon={MapIcon} label="Map View" />
                </>
              )}
            </nav>
            <div className="p-4 border-t border-gray-800">
              <button onClick={onLogout} className="flex items-center space-x-3 text-red-400">
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white shadow-sm border-b p-4 flex justify-between items-center">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} className="text-gray-600" />
          </button>
          <h1 className="font-semibold text-gray-800">
            {user.role === UserRole.ADMIN ? 'Admin Portal' : 'Field Worker'}
          </h1>
          <div className="w-6" /> {/* Spacer */}
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};