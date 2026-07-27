import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Briefcase, Award, AlertTriangle, Code } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('participant');
  
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [apiError, setApiError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setApiError('');

    // Validations
    if (!name || !email || !password || !role) {
      setValidationError('Please fill in all fields');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register(name, email, password, role);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setApiError(result.message);
    }
  };

  const roleOptions = [
    {
      id: 'participant',
      title: 'Participant',
      desc: 'Hack and build projects',
      icon: Code,
      color: 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
    },
    {
      id: 'organizer',
      title: 'Organizer',
      desc: 'Host events & coordinate',
      icon: Briefcase,
      color: 'border-purple-500 text-purple-400 bg-purple-500/5'
    },
    {
      id: 'judge',
      title: 'Judge',
      desc: 'Evaluate submissions',
      icon: Award,
      color: 'border-pink-500 text-pink-400 bg-pink-500/5'
    }
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <Card className="border-gray-800 shadow-2xl bg-[#111625]/60 backdrop-blur-md">
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex p-3 bg-indigo-500/10 text-indigo-400 rounded-xl mb-2">
              <UserPlus className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-white">Create an Account</h2>
            <p className="text-gray-400 text-sm">Join the HackMatrix ecosystem</p>
          </div>

          {(validationError || apiError) && (
            <div className="mb-6 p-4 bg-red-600/10 border border-red-500/30 rounded-lg flex items-start space-x-2 text-red-400 text-sm">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{validationError || apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <User className="h-4.5 w-4.5" />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg pl-10.5 pr-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition duration-200"
                />
              </div>
            </div>

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
                Password (min. 6 characters)
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

            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                Select Your Role
              </label>
              <div className="grid grid-cols-3 gap-3">
                {roleOptions.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setRole(opt.id)}
                    className={`border rounded-xl p-3 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-1.5 hover:border-indigo-500/50 ${
                      role === opt.id
                        ? opt.color
                        : 'border-gray-800 text-gray-400 hover:bg-gray-800/20'
                    }`}
                  >
                    <opt.icon className="h-5 w-5" />
                    <span className="text-xs font-bold block">{opt.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full py-3">
              Create Account
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline transition">
              Sign In
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
