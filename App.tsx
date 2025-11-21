import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { authService } from './services/authService';
import { User, UserRole } from './types';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { NewConnection } from './pages/field/NewConnection';
import { MySubmissions } from './pages/field/MySubmissions';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { SubmissionList } from './pages/admin/SubmissionList';
import { SubmissionDetail } from './pages/admin/SubmissionDetail';
import { MapView } from './pages/admin/MapView';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  user: User | null;
  requiredRole?: UserRole;
  children?: React.ReactNode;
  onLogout: () => void;
}

// Protected Route Wrapper
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  user, 
  requiredRole,
  onLogout
}) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard if role doesn't match
    return <Navigate to={user.role === UserRole.ADMIN ? '/admin/dashboard' : '/'} replace />;
  }
  return <Layout user={user} onLogout={onLogout}>{children}</Layout>;
};

// Field Worker Home Redirect
const FieldHome = ({ user }: { user: User }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white mb-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name.split(' ')[0]}!</h1>
        <p className="opacity-90 mb-6">Ready to capture new FHTC data today?</p>
        <div className="flex flex-wrap gap-4">
          <Link to="/new" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition shadow">Start New Entry</Link>
          <Link to="/submissions" className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition border border-blue-500">View History</Link>
        </div>
      </div>
      <MySubmissions user={user} />
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to={user.role === UserRole.ADMIN ? "/admin/dashboard" : "/"} replace /> : <Login onLogin={handleLogin} />
        } />
        
        {/* Field Worker Routes */}
        <Route path="/" element={
          <ProtectedRoute user={user} requiredRole={UserRole.FIELD_WORKER} onLogout={handleLogout}>
             {user && <FieldHome user={user} />}
          </ProtectedRoute>
        } />
        <Route path="/new" element={
          <ProtectedRoute user={user} requiredRole={UserRole.FIELD_WORKER} onLogout={handleLogout}>
            {user && <NewConnection user={user} />}
          </ProtectedRoute>
        } />
        <Route path="/submissions" element={
          <ProtectedRoute user={user} requiredRole={UserRole.FIELD_WORKER} onLogout={handleLogout}>
            {user && <MySubmissions user={user} />}
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute user={user} requiredRole={UserRole.ADMIN} onLogout={handleLogout}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/submissions" element={
          <ProtectedRoute user={user} requiredRole={UserRole.ADMIN} onLogout={handleLogout}>
            <SubmissionList />
          </ProtectedRoute>
        } />
        <Route path="/admin/submissions/:id" element={
          <ProtectedRoute user={user} requiredRole={UserRole.ADMIN} onLogout={handleLogout}>
            <SubmissionDetail />
          </ProtectedRoute>
        } />
        <Route path="/admin/map" element={
          <ProtectedRoute user={user} requiredRole={UserRole.ADMIN} onLogout={handleLogout}>
            <MapView />
          </ProtectedRoute>
        } />

        {/* Catch all */}
        <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;