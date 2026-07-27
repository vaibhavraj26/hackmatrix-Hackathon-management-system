import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertTriangle } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [apiError, setApiError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setApiError('');

    // Validations
    if (!email || !password) {
      setValidationError('Please fill in all fields');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setApiError(result.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="border-gray-800 shadow-2xl relative bg-[#111625]/60 backdrop-blur-md">
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex p-3 bg-indigo-500/10 text-indigo-400 rounded-xl mb-2">
              <LogIn className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            <p className="text-gray-400 text-sm">Sign in to your HackMatrix account</p>
          </div>

          {(validationError || apiError) && (
            <div className="mb-6 p-4 bg-red-600/10 border border-red-500/30 rounded-lg flex items-start space-x-2 text-red-400 text-sm">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{validationError || apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg pl-10.5 pr-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition duration-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg pl-10.5 pr-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition duration-200"
                />
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full py-3">
              Sign In
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline transition">
              Create an account
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
