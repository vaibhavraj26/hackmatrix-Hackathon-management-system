import React, { useEffect, useState } from 'react';
import { api } from '../../context/AuthContext';
import { Users, Trophy, Code, ShieldCheck, Ban, Sparkles, Trash2, Edit2, Check, X, AlertTriangle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Edit role states
  const [editingUserId, setEditingUserId] = useState(null);
  const [editRole, setEditRole] = useState('');

  const fetchAdminData = async () => {
    try {
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data.data);

      const usersRes = await api.get('/admin/users');
      setUsers(usersRes.data.data);

      const hackathonsRes = await api.get('/hackathons');
      setHackathons(hackathonsRes.data.data);
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
      setErrorMsg('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleBlock = async (userId) => {
    setActionLoading(true);
    try {
      await api.put(`/admin/users/${userId}/block`);
      fetchAdminData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to toggle user block status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setActionLoading(true);
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchAdminData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRole = async (userId) => {
    setActionLoading(true);
    try {
      await api.put(`/admin/users/${userId}`, { role: editRole });
      setEditingUserId(null);
      fetchAdminData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update user role');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteHackathon = async (hackId) => {
    if (!window.confirm('Are you sure you want to delete this hackathon?')) return;
    setActionLoading(true);
    try {
      await api.delete(`/hackathons/${hackId}`);
      fetchAdminData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete hackathon');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading Admin Dashboard...</div>;

  // Chart structures
  const roleChartData = stats ? [
    { name: 'Admins', value: stats.users.admin, fill: '#6366F1' },
    { name: 'Organizers', value: stats.users.organizer, fill: '#A855F7' },
    { name: 'Participants', value: stats.users.participant, fill: '#14B8A6' },
    { name: 'Judges', value: stats.users.judge, fill: '#EC4899' }
  ] : [];

  const activityChartData = stats ? [
    { name: 'Hackathons', count: stats.hackathons },
    { name: 'Teams', count: stats.teams },
    { name: 'Submissions', count: stats.submissions }
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center space-x-2">
          <ShieldCheck className="h-7 w-7 text-indigo-400" />
          <span>System Administration</span>
        </h1>
        <p className="text-gray-400 mt-1">Review system metrics, modify user privileges, and manage platform listings.</p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-600/10 border border-red-500/20 text-red-400 text-sm rounded-lg flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Total Registered Users</span>
            <span className="text-xl font-bold text-white">{stats?.users.total}</span>
          </div>
        </Card>
        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Total Hackathons</span>
            <span className="text-xl font-bold text-white">{stats?.hackathons}</span>
          </div>
        </Card>
        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Total Teams formed</span>
            <span className="text-xl font-bold text-white">{stats?.teams}</span>
          </div>
        </Card>
        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-pink-500/10 text-pink-400 rounded-xl">
            <Code className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Project Submissions</span>
            <span className="text-xl font-bold text-white">{stats?.submissions}</span>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Platform Activities</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityChartData}>
                <XAxis dataKey="name" stroke="#6B7280" fontSize={11} />
                <YAxis stroke="#6B7280" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#111625', border: '1px solid #1F2937' }} />
                <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="space-y-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">User Distribution</h3>
          <div className="h-60 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {roleChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111625', border: '1px solid #1F2937' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Database Lists tab selectors */}
      <div className="space-y-6">
        <div className="flex border-b border-gray-800 space-x-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 transition-colors ${
              activeTab === 'users' ? 'border-b-2 border-indigo-500 text-indigo-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            Manage Users
          </button>
          <button
            onClick={() => setActiveTab('hackathons')}
            className={`pb-3 transition-colors ${
              activeTab === 'hackathons' ? 'border-b-2 border-indigo-500 text-indigo-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            Manage Hackathons
          </button>
        </div>

        {activeTab === 'users' && (
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider bg-gray-900/40">
                    <th className="py-3.5 px-6">Name</th>
                    <th className="py-3.5 px-6">Email</th>
                    <th className="py-3.5 px-6">Role</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-800/10 transition">
                      <td className="py-3.5 px-6 font-semibold text-white">{u.name}</td>
                      <td className="py-3.5 px-6">{u.email}</td>
                      <td className="py-3.5 px-6">
                        {editingUserId === u._id ? (
                          <div className="flex items-center space-x-1.5">
                            <select
                              value={editRole}
                              onChange={(e) => setEditRole(e.target.value)}
                              className="bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded px-2 py-1 text-xs text-white"
                            >
                              <option value="participant">Participant</option>
                              <option value="organizer">Organizer</option>
                              <option value="judge">Judge</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button
                              onClick={() => handleUpdateRole(u._id)}
                              className="text-emerald-400 hover:text-emerald-300"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditingUserId(null)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="capitalize text-xs font-bold text-indigo-400 flex items-center space-x-1">
                            <span>{u.role}</span>
                            <button
                              onClick={() => {
                                setEditingUserId(u._id);
                                setEditRole(u.role);
                              }}
                              className="text-gray-500 hover:text-white transition ml-1"
                              title="Edit Role"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            u.isBlocked
                              ? 'bg-red-600/10 border-red-500/20 text-red-400'
                              : 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {u.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right flex justify-end items-center space-x-2">
                        {u.role !== 'admin' && (
                          <>
                            <button
                              onClick={() => handleToggleBlock(u._id)}
                              className={`p-1.5 rounded-lg border transition ${
                                u.isBlocked
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-600 hover:text-white'
                                  : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400 hover:bg-yellow-600 hover:text-white'
                              }`}
                              title={u.isBlocked ? 'Unblock User' : 'Block User'}
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-600 hover:text-white transition"
                              title="Delete User"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'hackathons' && (
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider bg-gray-900/40">
                    <th className="py-3.5 px-6">Title</th>
                    <th className="py-3.5 px-6">Theme</th>
                    <th className="py-3.5 px-6">Organizer</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {hackathons.map((h) => (
                    <tr key={h._id} className="hover:bg-gray-800/10 transition">
                      <td className="py-3.5 px-6 font-semibold text-white">
                        <Link to={`/hackathons/${h._id}`} className="hover:underline">
                          {h.title}
                        </Link>
                      </td>
                      <td className="py-3.5 px-6 capitalize">{h.theme}</td>
                      <td className="py-3.5 px-6 text-xs text-gray-400">{h.organizer?.name || 'Unknown'}</td>
                      <td className="py-3.5 px-6 capitalize">
                        <span className="text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-300">{h.status}</span>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => handleDeleteHackathon(h._id)}
                          className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-600 hover:text-white transition"
                          title="Delete Hackathon"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
