import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Terminal, Sparkles, KeyRound, CheckCircle, AlertTriangle } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const GithubIcon = () => (
  <svg className="h-4 w-4 text-indigo-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);

const LinkedinIcon = () => (
  <svg className="h-4 w-4 text-indigo-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
  </svg>
);

export default function Profile() {
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [techStackText, setTechStackText] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [avatar, setAvatar] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.profile?.bio || '');
      setTechStackText(user.profile?.techStack?.join(', ') || '');
      setGithub(user.profile?.github || '');
      setLinkedin(user.profile?.linkedin || '');
      setAvatar(user.profile?.avatar || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (password && password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setLoading(true);
    const techStack = techStackText
      ? techStackText.split(',').map((t) => t.trim()).filter((t) => t !== '')
      : [];

    const profileData = {
      name,
      profile: {
        bio,
        techStack,
        github,
        linkedin,
        avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`
      }
    };

    if (password) {
      profileData.password = password;
    }

    const result = await updateProfile(profileData);
    setLoading(false);

    if (result.success) {
      setSuccessMsg('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } else {
      setErrorMsg(result.message);
    }
  };

  if (!user) return <div className="text-center py-20 text-gray-400">Loading user profile...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center space-x-2">
            <Sparkles className="h-7 w-7 text-indigo-400" />
            <span>My Profile</span>
          </h1>
          <p className="text-gray-400 mt-1">Manage your professional bio, coding stack, and account configurations.</p>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-600/10 border border-emerald-500/30 rounded-lg flex items-start space-x-2 text-emerald-400 text-sm">
            <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-600/10 border border-red-500/30 rounded-lg flex items-start space-x-2 text-red-400 text-sm">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Avatar and Info Card */}
          <div className="space-y-6">
            <Card className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <img
                  src={avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`}
                  alt={name}
                  className="h-28 w-28 rounded-2xl bg-gray-800 p-2 border border-indigo-500/20 shadow-lg"
                />
                <span className="absolute bottom-0 right-0 bg-indigo-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-gray-900">
                  {user.role}
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">{user.name}</h3>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </Card>

            <Card className="space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Account Role</h3>
              <p className="text-sm text-gray-400">
                You are registered as a <span className="text-indigo-400 font-bold capitalize">{user.role}</span>. Contact system admins to modify account privileges.
              </p>
            </Card>
          </div>

          {/* Form Fields Card */}
          <div className="md:col-span-2 space-y-6">
            <Card className="space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-2">Profile Details</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="avatar" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Avatar Image URL
                  </label>
                  <input
                    id="avatar"
                    type="text"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.png"
                    className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="bio" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Biography / Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself, your coding journey, or hackathon history..."
                  rows={4}
                  className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="techStack" className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center space-x-1">
                  <Terminal className="h-4 w-4 text-teal-400" />
                  <span>Tech Stack (Comma Separated)</span>
                </label>
                <input
                  id="techStack"
                  type="text"
                  value={techStackText}
                  onChange={(e) => setTechStackText(e.target.value)}
                  placeholder="React, Node.js, Express, MongoDB, Python, Go"
                  className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="github" className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center space-x-1">
                    <GithubIcon />
                    <span>GitHub Profile Link</span>
                  </label>
                  <input
                    id="github"
                    type="text"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="linkedin" className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center space-x-1">
                    <LinkedinIcon />
                    <span>LinkedIn Profile Link</span>
                  </label>
                  <input
                    id="linkedin"
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition"
                  />
                </div>
              </div>
            </Card>

            <Card className="space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-2 flex items-center space-x-2">
                <KeyRound className="h-5 w-5 text-indigo-400" />
                <span>Security (Change Password)</span>
              </h3>
              <p className="text-xs text-gray-400">Leave fields blank if you do not want to alter your password.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="pass" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    New Password
                  </label>
                  <input
                    id="pass"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="confPass" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <input
                    id="confPass"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition"
                  />
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" loading={loading} className="px-8">
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
