import React, { useEffect, useState } from 'react';
import { api } from '../../context/AuthContext';
import { Trophy, Users, ShieldAlert, Award, FileCode, CheckCircle, XCircle, Plus, Calendar, Star, Check, AlertTriangle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

export default function OrganizerDashboard() {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Selected Hackathon to manage
  const [selectedHackId, setSelectedHackId] = useState('');
  const [selectedHack, setSelectedHack] = useState(null);
  const [teams, setTeams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [availableJudges, setAvailableJudges] = useState([]);
  const [assignedJudgeIds, setAssignedJudgeIds] = useState([]);
  
  // Dashboard view toggle
  const [view, setView] = useState('list'); // 'list', 'create', 'manage'
  const [manageTab, setManageTab] = useState('teams'); // 'teams', 'judges', 'submissions'

  // Create Hackathon Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [theme, setTheme] = useState('');
  const [mode, setMode] = useState('online');
  const [venue, setVenue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [banner, setBanner] = useState('');
  const [prizePool, setPrizePool] = useState('');
  const [maxTeamSize, setMaxTeamSize] = useState('4');
  
  // Rules/Criteria array states
  const [rules, setRules] = useState(['']);
  const [criteria, setCriteria] = useState([
    { name: 'Innovation', maxScore: 10 },
    { name: 'Technical Complexity', maxScore: 10 },
    { name: 'User Interface', maxScore: 10 },
    { name: 'Functionality', maxScore: 10 }
  ]);

  const fetchHackathons = async () => {
    try {
      const res = await api.get('/hackathons');
      // Filter hackathons created by the logged in user (or show all if admin, but organizer only displays their own)
      setHackathons(res.data.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load hackathons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, []);

  const handleCreateHackathon = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (new Date(registrationDeadline) > new Date(startDate)) {
      setErrorMsg('Registration deadline must be before coding start date');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setErrorMsg('Coding start date must be before end date');
      return;
    }

    setActionLoading(true);
    
    const formattedRules = rules.filter(r => r.trim() !== '');

    const data = {
      title,
      description,
      theme,
      mode,
      venue,
      startDate,
      endDate,
      registrationDeadline,
      banner: banner || undefined,
      prizePool: Number(prizePool) || 0,
      maxTeamSize: Number(maxTeamSize) || 4,
      rules: formattedRules,
      judgingCriteria: criteria
    };

    try {
      await api.post('/hackathons', data);
      setSuccessMsg('Hackathon created successfully!');
      setView('list');
      fetchHackathons();
      
      // Reset form
      setTitle('');
      setDescription('');
      setTheme('');
      setMode('online');
      setVenue('');
      setStartDate('');
      setEndDate('');
      setRegistrationDeadline('');
      setBanner('');
      setPrizePool('');
      setMaxTeamSize('4');
      setRules(['']);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create hackathon');
    } finally {
      setActionLoading(false);
    }
  };

  // Manage view details loading
  const handleManageHackathon = async (hackathon) => {
    setSelectedHackId(hackathon._id);
    setSelectedHack(hackathon);
    setLoading(true);
    setView('manage');
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Fetch teams
      const teamsRes = await api.get(`/teams/hackathon/${hackathon._id}`);
      setTeams(teamsRes.data.data);

      // Fetch submissions
      const subRes = await api.get(`/submissions/hackathon/${hackathon._id}`);
      setSubmissions(subRes.data.data);

      // Fetch all judges
      const judgesRes = await api.get('/hackathons/judges/all');
      setAvailableJudges(judgesRes.data.data);
      
      setAssignedJudgeIds(hackathon.judges?.map(j => j._id || j) || []);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load management details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTeamStatus = async (teamId, status) => {
    setActionLoading(true);
    try {
      await api.put(`/teams/${teamId}/status`, { status });
      setSuccessMsg(`Team status updated to ${status}`);
      // Refresh teams
      const teamsRes = await api.get(`/teams/hackathon/${selectedHackId}`);
      setTeams(teamsRes.data.data);
    } catch (err) {
      setErrorMsg('Failed to update team registration status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateSubmissionStatus = async (subId, status) => {
    setActionLoading(true);
    try {
      await api.put(`/submissions/${subId}/status`, { status });
      setSuccessMsg(`Submission status updated to ${status}`);
      // Refresh submissions
      const subRes = await api.get(`/submissions/hackathon/${selectedHackId}`);
      setSubmissions(subRes.data.data);
    } catch (err) {
      setErrorMsg('Failed to update project status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveJudges = async () => {
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.put(`/hackathons/${selectedHackId}/judges`, { judgeIds: assignedJudgeIds });
      setSuccessMsg('Judges assigned successfully!');
    } catch (err) {
      setErrorMsg('Failed to assign judges');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleJudgeSelection = (judgeId) => {
    if (assignedJudgeIds.includes(judgeId)) {
      setAssignedJudgeIds(assignedJudgeIds.filter(id => id !== judgeId));
    } else {
      setAssignedJudgeIds([...assignedJudgeIds, judgeId]);
    }
  };

  // Rule management helpers
  const handleAddRule = () => setRules([...rules, '']);
  const handleRuleChange = (idx, val) => {
    const nextRules = [...rules];
    nextRules[idx] = val;
    setRules(nextRules);
  };
  const handleRemoveRule = (idx) => setRules(rules.filter((_, i) => i !== idx));

  // Criteria score helpers
  const handleCriteriaChange = (idx, field, val) => {
    const nextCriteria = [...criteria];
    nextCriteria[idx][field] = field === 'maxScore' ? Number(val) : val;
    setCriteria(nextCriteria);
  };

  if (loading && view === 'list') {
    return <div className="text-center py-20 text-gray-400">Loading Organizer Dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-6">
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest block">Dashboard</span>
          <h1 className="text-3xl font-extrabold text-white">Organizer Workspace</h1>
          <p className="text-gray-400 text-sm mt-1">Host hackathons, review registrations, allocate judges, and grade solutions.</p>
        </div>

        {view === 'list' && (
          <Button onClick={() => setView('create')} className="flex items-center space-x-1">
            <Plus className="h-5 w-5" />
            <span>Create Hackathon</span>
          </Button>
        )}

        {view !== 'list' && (
          <Button variant="outline" onClick={() => { setView('list'); setSelectedHack(null); }}>
            Back to Dashboard List
          </Button>
        )}
      </div>

      {(successMsg || errorMsg) && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 text-sm ${
          successMsg ? 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-600/10 border border-red-500/20 text-red-400'
        }`}>
          {successMsg ? <Check className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
          <span>{successMsg || errorMsg}</span>
        </div>
      )}

      {/* VIEW: Hackathon List */}
      {view === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hackathons.length === 0 ? (
            <Card className="col-span-3 text-center py-16 text-gray-400">
              No hackathons found. Click "Create Hackathon" to publish your first coding event!
            </Card>
          ) : (
            hackathons.map((h) => (
              <Card key={h._id} className="flex flex-col justify-between h-full space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-indigo-400 font-semibold uppercase">{h.theme}</span>
                    <span className="text-gray-400 bg-gray-800 px-2 py-0.5 rounded capitalize">{h.status}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight">{h.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-3">{h.description}</p>
                </div>
                <div className="pt-4 border-t border-gray-800/80 flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-medium">Max Teams: {h.maxTeamSize}</span>
                  <Button variant="secondary" onClick={() => handleManageHackathon(h)} className="px-3.5 py-1.5 text-xs">
                    Manage Event
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* VIEW: Create Hackathon Form */}
      {view === 'create' && (
        <form onSubmit={handleCreateHackathon} className="space-y-6 max-w-4xl mx-auto">
          <Card className="space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-2">Core Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase block">Hackathon Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. InnovateX Global"
                  required
                  className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase block">Theme</label>
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="e.g. AI / Web3 / FinTech"
                  required
                  className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase block">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed explanation of the hackathon challenge, prizes, and schedule..."
                rows={5}
                required
                className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition resize-none"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase block">Mode</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-white outline-none transition"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-gray-400 uppercase block">Venue (Offline venue or Virtual links)</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Seminar Hall A, Campus 1 or Gather Town"
                  className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition"
                />
              </div>
            </div>
          </Card>

          <Card className="space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-2">Timeline & Setup</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase block">Registration Deadline</label>
                <input
                  type="datetime-local"
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                  required
                  className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-white outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase block">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-white outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase block">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-white outline-none transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase block">Prize Pool ($)</label>
                <input
                  type="number"
                  value={prizePool}
                  onChange={(e) => setPrizePool(e.target.value)}
                  placeholder="e.g. 10000"
                  required
                  className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase block">Max Team Size</label>
                <input
                  type="number"
                  value={maxTeamSize}
                  onChange={(e) => setMaxTeamSize(e.target.value)}
                  placeholder="e.g. 4"
                  min="1"
                  required
                  className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-white outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase block">Banner Image URL</label>
                <input
                  type="text"
                  value={banner}
                  onChange={(e) => setBanner(e.target.value)}
                  placeholder="https://example.com/banner.png"
                  className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition"
                />
              </div>
            </div>
          </Card>

          <Card className="space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-2">Rules</h3>
            <div className="space-y-3">
              {rules.map((rule, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={rule}
                    onChange={(e) => handleRuleChange(idx, e.target.value)}
                    placeholder={`Rule #${idx + 1}`}
                    className="flex-grow bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2 text-sm text-white outline-none transition"
                  />
                  {rules.length > 1 && (
                    <Button variant="danger" onClick={() => handleRemoveRule(idx)} className="py-2 px-3">
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" onClick={handleAddRule} className="text-xs py-2">
                + Add Rule Row
              </Button>
            </div>
          </Card>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setView('list')}>
              Cancel
            </Button>
            <Button type="submit" loading={actionLoading} className="px-8">
              Publish Event
            </Button>
          </div>
        </form>
      )}

      {/* VIEW: Manage Hackathon Dashboard */}
      {view === 'manage' && selectedHack && (
        <div className="space-y-6">
          <div className="bg-[#111625] border border-gray-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">{selectedHack.theme}</span>
              <h2 className="text-xl font-bold text-white">{selectedHack.title}</h2>
              <p className="text-xs text-gray-500">Timeline: {new Date(selectedHack.startDate).toLocaleDateString()} - {new Date(selectedHack.endDate).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              <span className="text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3.5 py-1.5 rounded-xl font-bold uppercase">
                Mode: {selectedHack.mode}
              </span>
            </div>
          </div>

          {/* Manage Sub-Tabs */}
          <div className="flex border-b border-gray-800 space-x-6 text-sm font-semibold">
            {[
              { id: 'teams', label: `Registered Teams (${teams.length})` },
              { id: 'judges', label: 'Assign Judges' },
              { id: 'submissions', label: `Project Submissions (${submissions.length})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setManageTab(tab.id)}
                className={`pb-3 transition-colors ${
                  manageTab === tab.id
                    ? 'border-b-2 border-indigo-500 text-indigo-400 font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="pt-2">
            {/* Sub-Tab 1: Teams List */}
            {manageTab === 'teams' && (
              <Card className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-300">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase bg-gray-900/40">
                        <th className="py-3 px-6">Team Name</th>
                        <th className="py-3 px-6">Leader</th>
                        <th className="py-3 px-6">Members Count</th>
                        <th className="py-3 px-6">Status</th>
                        <th className="py-3 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {teams.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-10 text-center text-gray-500">
                            No teams have registered for this event yet.
                          </td>
                        </tr>
                      ) : (
                        teams.map((t) => (
                          <tr key={t._id} className="hover:bg-gray-800/10">
                            <td className="py-3.5 px-6 font-semibold text-white">
                              <Link to={`/teams/${t._id}`} className="hover:underline text-indigo-400">
                                {t.name}
                              </Link>
                            </td>
                            <td className="py-3.5 px-6 text-xs text-gray-400">{t.leader?.name || 'Unknown'}</td>
                            <td className="py-3.5 px-6 font-mono text-xs">{t.members?.length || 1}</td>
                            <td className="py-3.5 px-6">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                t.registrationStatus === 'approved'
                                  ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400'
                                  : t.registrationStatus === 'rejected'
                                  ? 'bg-red-600/10 border-red-500/20 text-red-400'
                                  : 'bg-yellow-600/10 border-yellow-500/20 text-yellow-400'
                              }`}>
                                {t.registrationStatus}
                              </span>
                            </td>
                            <td className="py-3.5 px-6 text-right flex justify-end space-x-1.5">
                              {t.registrationStatus !== 'approved' && (
                                <Button
                                  variant="primary"
                                  onClick={() => handleUpdateTeamStatus(t._id, 'approved')}
                                  loading={actionLoading}
                                  className="px-2.5 py-1 text-[10px] uppercase font-bold"
                                >
                                  Approve
                                </Button>
                              )}
                              {t.registrationStatus !== 'rejected' && (
                                <Button
                                  variant="danger"
                                  onClick={() => handleUpdateTeamStatus(t._id, 'rejected')}
                                  loading={actionLoading}
                                  className="px-2.5 py-1 text-[10px] uppercase font-bold"
                                >
                                  Reject
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Sub-Tab 2: Judge Allocations */}
            {manageTab === 'judges' && (
              <Card className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Allocate Judges</h3>
                  <p className="text-gray-400 text-xs mt-1">Select judges registered on the platform to assign them evaluation rights for this event.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {availableJudges.length === 0 ? (
                    <p className="text-gray-500 text-sm col-span-3">No judges registered on the platform yet.</p>
                  ) : (
                    availableJudges.map((judge) => {
                      const isSelected = assignedJudgeIds.includes(judge._id);
                      return (
                        <div
                          key={judge._id}
                          onClick={() => toggleJudgeSelection(judge._id)}
                          className={`p-4 border rounded-xl cursor-pointer transition flex items-center space-x-3 ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-500/5 text-indigo-400'
                              : 'border-gray-800 text-gray-400 hover:bg-gray-800/20'
                          }`}
                        >
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                            isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'
                          }`}>
                            {judge.name[0].toUpperCase()}
                          </div>
                          <div>
                            <span className="text-xs font-bold block text-white">{judge.name}</span>
                            <span className="text-[10px] text-gray-500 truncate block max-w-[150px]">{judge.email}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-800/80">
                  <Button onClick={handleSaveJudges} loading={actionLoading}>
                    Save Judge Allocations
                  </Button>
                </div>
              </Card>
            )}

            {/* Sub-Tab 3: Submissions */}
            {manageTab === 'submissions' && (
              <Card className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-300">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase bg-gray-900/40">
                        <th className="py-3 px-6">Project Name</th>
                        <th className="py-3 px-6">Team</th>
                        <th className="py-3 px-6">Links</th>
                        <th className="py-3 px-6">Status</th>
                        <th className="py-3 px-6 text-right">Review Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {submissions.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-10 text-center text-gray-500">
                            No project submissions have been uploaded yet.
                          </td>
                        </tr>
                      ) : (
                        submissions.map((s) => (
                          <tr key={s._id} className="hover:bg-gray-800/10">
                            <td className="py-3.5 px-6 font-semibold text-white">{s.projectName}</td>
                            <td className="py-3.5 px-6 text-xs text-gray-400">{s.team?.name || 'Unknown Team'}</td>
                            <td className="py-3.5 px-6 text-xs space-y-1">
                              <a href={s.githubUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline block">
                                GitHub Repository
                              </a>
                              {s.demoUrl && (
                                <a href={s.demoUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline block">
                                  Live Demo
                                </a>
                              )}
                            </td>
                            <td className="py-3.5 px-6">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                s.status === 'approved'
                                  ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400'
                                  : s.status === 'rejected'
                                  ? 'bg-red-600/10 border-red-500/20 text-red-400'
                                  : 'bg-yellow-600/10 border-yellow-500/20 text-yellow-400'
                              }`}>
                                {s.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-6 text-right flex justify-end space-x-1.5 items-center">
                              <select
                                value={s.status}
                                onChange={(e) => handleUpdateSubmissionStatus(s._id, e.target.value)}
                                className="bg-[#0B0F19] border border-gray-800 text-xs text-white rounded px-2.5 py-1 outline-none"
                              >
                                <option value="pending">Pending</option>
                                <option value="under_review">Under Review</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
