import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';
import { Droplets, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const user = await authService.login(username);
      if (user) {
        onLogin(user); // Update global state immediately
        // Navigation is handled by the parent App component via <Navigate>
      } else {
        setError('Invalid username. Try "admin" or "worker".');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-900 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 space-y-8">
        <div className="text-center">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Droplets className="text-blue-600" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">GeoTAG 360</h2>
          <p className="text-gray-500 mt-2">Sign in to access the portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter 'admin' or 'worker'"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="text-center text-xs text-gray-400">
          <p>Demo Credentials:</p>
          <p>Admin: <span className="font-mono text-gray-600">admin</span></p>
          <p>Worker: <span className="font-mono text-gray-600">worker</span></p>
        </div>
      </div>
    </div>
  );
};