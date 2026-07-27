import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import { Calendar, Award, MapPin, Globe, Users, BookOpen, User, Star, Trophy, ListCollapse, CheckCircle, ChevronRight } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

export default function HackathonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  
  // Registration modal and state
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [regMode, setRegMode] = useState(''); // 'create' or 'join'
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [myTeam, setMyTeam] = useState(null);
  
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [lbLoading, setLbLoading] = useState(false);

  const fetchDetails = async () => {
    try {
      const res = await api.get(`/hackathons/${id}`);
      setHackathon(res.data.data);

      if (user && user.role === 'participant') {
        const myTeamsRes = await api.get('/teams/my');
        const teamForHackathon = myTeamsRes.data.data.find(
          (t) => t.hackathon && t.hackathon._id === id
        );
        if (teamForHackathon) {
          setMyTeam(teamForHackathon);
        }
      }
    } catch (err) {
      console.error('Error loading hackathon details', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLbLoading(true);
    try {
      const res = await api.get(`/reviews/leaderboard/${id}`);
      setLeaderboard(res.data.data);
    } catch (err) {
      console.error('Error fetching leaderboard', err);
    } finally {
      setLbLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id, user]);

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      fetchLeaderboard();
    }
  }, [activeTab]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setRegError('');
    if (!teamName) {
      setRegError('Please provide a team name');
      return;
    }

    setRegLoading(true);
    try {
      const res = await api.post('/teams', {
        name: teamName,
        hackathonId: id
      });
      setIsRegModalOpen(false);
      navigate(`/teams/${res.data.data._id}`);
    } catch (err) {
      setRegError(err.response?.data?.message || 'Failed to create team');
    } finally {
      setRegLoading(false);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    setRegError('');
    if (!inviteCode) {
      setRegError('Please enter an invite code');
      return;
    }

    setRegLoading(true);
    try {
      const res = await api.post('/teams/join', {
        inviteCode: inviteCode.trim().toUpperCase()
      });
      setIsRegModalOpen(false);
      navigate(`/teams/${res.data.data._id}`);
    } catch (err) {
      setRegError(err.response?.data?.message || 'Failed to join team');
    } finally {
      setRegLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading hackathon details...</div>;
  }

  if (!hackathon) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>Hackathon not found.</p>
        <Link to="/hackathons" className="text-indigo-400 underline mt-4 block">
          Back to listings
        </Link>
      </div>
    );
  }

  const isRegistrationOpen = new Date() <= new Date(hackathon.registrationDeadline);
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Banner / Header */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-800 h-64 md:h-80 shadow-2xl">
        <img
          src={hackathon.banner}
          alt={hackathon.title}
          className="w-full h-full object-cover blur-[1px] brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070A13] via-transparent to-transparent" />
        
        <div className="absolute bottom-6 left-6 md:left-10 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              {hackathon.theme}
            </span>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight">{hackathon.title}</h1>
          </div>
          
          <div className="shrink-0 flex items-center space-x-2">
            {myTeam ? (
              <Link to={`/teams/${myTeam._id}`}>
                <Button variant="secondary" className="px-6">
                  View My Team <CheckCircle className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : user?.role === 'participant' ? (
              isRegistrationOpen ? (
                <Button onClick={() => setIsRegModalOpen(true)} className="px-6 py-3">
                  Register Now
                </Button>
              ) : (
                <span className="bg-red-900/30 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg font-bold text-sm uppercase">
                  Registration Closed
                </span>
              )
            ) : user ? (
              // Organizer/Judge views
              hackathon.organizer?._id === user._id || user.role === 'admin' ? (
                <Link to={`/organizer-dashboard?hackathon=${id}`}>
                  <Button variant="secondary">Manage Hackathon</Button>
                </Link>
              ) : hackathon.judges.some(j => j._id === user._id) ? (
                <Link to="/judge-dashboard">
                  <Button variant="secondary">Evaluate Projects</Button>
                </Link>
              ) : null
            ) : (
              <Link to="/login">
                <Button className="px-6">Login to Register</Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Grid Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left main: Tabbed description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-gray-800 space-x-6 text-sm font-semibold">
            {[
              { id: 'about', label: 'About' },
              { id: 'rules', label: 'Rules & Criteria' },
              { id: 'judges', label: 'Organizer & Judges' },
              { id: 'leaderboard', label: 'Leaderboard' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-indigo-500 text-indigo-400 font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="pt-2">
            {activeTab === 'about' && (
              <Card className="space-y-4">
                <h3 className="text-lg font-bold text-white">Event Description</h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">{hackathon.description}</p>
              </Card>
            )}

            {activeTab === 'rules' && (
              <div className="space-y-6">
                <Card className="space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-indigo-400" />
                    <span>Official Rules</span>
                  </h3>
                  {hackathon.rules && hackathon.rules.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-2 text-gray-300">
                      {hackathon.rules.map((rule, idx) => (
                        <li key={idx}>{rule}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400">No specific rules listed. Standard coding behaviors apply.</p>
                  )}
                </Card>

                <Card className="space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-indigo-400" />
                    <span>Judging Rubric</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {hackathon.judgingCriteria.map((c) => (
                      <div key={c._id} className="p-3.5 bg-gray-800/40 rounded-lg flex items-center justify-between border border-gray-800">
                        <span className="text-sm font-semibold text-white">{c.name}</span>
                        <span className="text-xs text-indigo-400 font-bold px-2 py-0.5 bg-indigo-500/10 rounded-full border border-indigo-500/10">
                          Max: {c.maxScore}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'judges' && (
              <div className="space-y-6">
                <Card className="space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <User className="h-5 w-5 text-indigo-400" />
                    <span>Host / Organizer</span>
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                      {hackathon.organizer?.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{hackathon.organizer?.name}</h4>
                      <p className="text-xs text-gray-500">{hackathon.organizer?.email}</p>
                    </div>
                  </div>
                </Card>

                <Card className="space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Star className="h-5 w-5 text-indigo-400" />
                    <span>Assigned Judges</span>
                  </h3>
                  {hackathon.judges && hackathon.judges.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {hackathon.judges.map((judge) => (
                        <div key={judge._id} className="p-3.5 bg-gray-800/20 border border-gray-800 rounded-xl flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-lg bg-gray-800 text-gray-400 flex items-center justify-center font-bold">
                            {judge.name[0].toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">{judge.name}</h4>
                            <p className="text-[10px] text-gray-500">{judge.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No judges assigned yet.</p>
                  )}
                </Card>
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <Card className="space-y-4">
                <h3 className="text-lg font-bold text-white">Live Leaderboard</h3>
                <p className="text-xs text-gray-400">Rankings updated automatically after judges submit criterion-based reviews.</p>
                
                {lbLoading ? (
                  <div className="py-10 text-center text-gray-500">Loading standings...</div>
                ) : leaderboard.length === 0 ? (
                  <div className="py-10 text-center text-gray-400">No project evaluation score records yet. Check back during evaluation phase.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                          <th className="py-3 px-4">Rank</th>
                          <th className="py-3 px-4">Team</th>
                          <th className="py-3 px-4">Project</th>
                          <th className="py-3 px-4 text-right">Avg Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/50">
                        {leaderboard.map((row) => (
                          <tr key={row.submissionId} className="hover:bg-gray-800/10">
                            <td className="py-3 px-4 font-bold">
                              {row.rank === 1 ? '🥇' : row.rank === 2 ? '🥈' : row.rank === 3 ? '🥉' : `#${row.rank}`}
                            </td>
                            <td className="py-3 px-4 font-semibold text-white">{row.teamName}</td>
                            <td className="py-3 px-4 text-gray-300">{row.projectName}</td>
                            <td className="py-3 px-4 text-right font-bold text-indigo-400">{row.averageScore}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>

        {/* Right side: Key Info Cards */}
        <div className="space-y-6">
          <Card className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider border-b border-gray-800 pb-2">Event Information</h3>
            
            <div className="space-y-3.5">
              <div className="flex items-start space-x-3 text-sm">
                <Calendar className="h-5 w-5 text-indigo-400 shrink-0" />
                <div>
                  <span className="text-xs text-gray-500 block">Registration Deadline</span>
                  <span className="text-white font-semibold">{formatDate(hackathon.registrationDeadline)}</span>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-sm">
                <Calendar className="h-5 w-5 text-indigo-400 shrink-0" />
                <div>
                  <span className="text-xs text-gray-500 block">Coding Phase Dates</span>
                  <span className="text-white font-semibold">
                    {formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-sm">
                <Award className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-xs text-gray-500 block">Prize Pool</span>
                  <span className="text-emerald-400 font-extrabold text-lg">${hackathon.prizePool.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-sm">
                <Users className="h-5 w-5 text-indigo-400 shrink-0" />
                <div>
                  <span className="text-xs text-gray-500 block">Max Team Size</span>
                  <span className="text-white font-semibold">{hackathon.maxTeamSize} Members</span>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-sm">
                {hackathon.mode === 'online' ? (
                  <>
                    <Globe className="h-5 w-5 text-indigo-400 shrink-0" />
                    <div>
                      <span className="text-xs text-gray-500 block">Mode</span>
                      <span className="text-white font-semibold capitalize">Online Hackathon</span>
                    </div>
                  </>
                ) : (
                  <>
                    <MapPin className="h-5 w-5 text-purple-400 shrink-0" />
                    <div>
                      <span className="text-xs text-gray-500 block">Venue / Mode</span>
                      <span className="text-white font-semibold">{hackathon.venue || 'Offline'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Registration Choices Modal */}
      <Modal
        isOpen={isRegModalOpen}
        onClose={() => {
          setIsRegModalOpen(false);
          setRegMode('');
          setRegError('');
        }}
        title="Register for Hackathon"
      >
        {regMode === '' ? (
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-400">To submit a project, you must participate within a team structure. Choose an option below:</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setRegMode('create')}
                className="p-5 border border-gray-800 hover:border-indigo-500/50 rounded-xl bg-gray-900/50 flex flex-col items-center justify-center space-y-2 text-center transition group"
              >
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg group-hover:bg-indigo-500 group-hover:text-white transition">
                  <Users className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold text-white block">Create Team</span>
                <span className="text-[10px] text-gray-500">Form a team as leader</span>
              </button>

              <button
                onClick={() => setRegMode('join')}
                className="p-5 border border-gray-800 hover:border-indigo-500/50 rounded-xl bg-gray-900/50 flex flex-col items-center justify-center space-y-2 text-center transition group"
              >
                <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg group-hover:bg-purple-500 group-hover:text-white transition">
                  <ChevronRight className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold text-white block">Join Team</span>
                <span className="text-[10px] text-gray-500">Join using invite code</span>
              </button>
            </div>
          </div>
        ) : regMode === 'create' ? (
          <form onSubmit={handleCreateTeam} className="space-y-4 py-2">
            {regError && <div className="text-red-400 text-xs p-2.5 bg-red-600/10 border border-red-500/20 rounded">{regError}</div>}
            
            <div className="space-y-1.5">
              <label htmlFor="teamName" className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                Team Name
              </label>
              <input
                id="teamName"
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Code Knights"
                className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-600 outline-none transition"
              />
            </div>
            
            <div className="flex justify-between gap-3 pt-2">
              <Button variant="outline" onClick={() => setRegMode('')} className="flex-grow">
                Back
              </Button>
              <Button type="submit" loading={regLoading} className="flex-grow">
                Create
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleJoinTeam} className="space-y-4 py-2">
            {regError && <div className="text-red-400 text-xs p-2.5 bg-red-600/10 border border-red-500/20 rounded">{regError}</div>}
            
            <div className="space-y-1.5">
              <label htmlFor="code" className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                Team Invite Code
              </label>
              <input
                id="code"
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="e.g. A3F89E"
                maxLength={6}
                className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-600 outline-none uppercase transition"
              />
            </div>
            
            <div className="flex justify-between gap-3 pt-2">
              <Button variant="outline" onClick={() => setRegMode('')} className="flex-grow">
                Back
              </Button>
              <Button type="submit" loading={regLoading} className="flex-grow">
                Join Team
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
