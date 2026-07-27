import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import { Users, User, Trash2, LogOut, ShieldAlert, Award, Copy, Check, Send, AlertTriangle } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

export default function TeamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [team, setTeam] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Leadership transfer selector
  const [newLeader, setNewLeader] = useState('');

  const fetchTeamDetails = async () => {
    try {
      const res = await api.get(`/teams/${id}`);
      setTeam(res.data.data);

      // Check if project has been submitted
      try {
        const subRes = await api.get(`/submissions/hackathon/${res.data.data.hackathon._id}`);
        const teamSub = subRes.data.data.find(sub => sub.team && sub.team._id === id);
        if (teamSub) {
          setSubmission(teamSub);
        }
      } catch (err) {
        console.error('Failed to load submission info', err);
      }
    } catch (err) {
      console.error('Failed to load team details', err);
      setErrorMsg('Failed to load team details. You may not be a member of this team.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamDetails();
  }, [id]);

  const copyInviteCode = () => {
    if (team) {
      navigator.clipboard.writeText(team.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm('Are you sure you want to leave this team?')) return;
    setActionLoading(true);
    try {
      await api.post(`/teams/${id}/leave`);
      navigate('/participant-dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to leave team');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!window.confirm('Are you sure you want to delete this team? This action is permanent.')) return;
    setActionLoading(true);
    try {
      await api.delete(`/teams/${id}`);
      navigate('/participant-dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete team');
    } finally {
      setActionLoading(false);
    }
  };

  const handleKickMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    setActionLoading(true);
    try {
      await api.delete(`/teams/${id}/members/${memberId}`);
      fetchTeamDetails();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to remove member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTransferLeadership = async (e) => {
    e.preventDefault();
    if (!newLeader) return;
    setActionLoading(true);
    try {
      await api.put(`/teams/${id}/transfer`, { newLeaderId: newLeader });
      setNewLeader('');
      fetchTeamDetails();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to transfer leadership');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading team dashboard...</div>;
  }

  if (errorMsg && !team) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <Card className="space-y-4">
          <AlertTriangle className="h-10 w-10 text-red-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Access Denied</h3>
          <p className="text-gray-400 text-sm">{errorMsg}</p>
          <Link to="/participant-dashboard">
            <Button variant="outline" className="w-full">Return to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isLeader = team.leader._id === user?._id;
  const isApproved = team.registrationStatus === 'approved';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-6">
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest block">Team Workspace</span>
          <h1 className="text-3xl font-extrabold text-white">{team.name}</h1>
          <p className="text-gray-400 text-sm mt-1">
            Registered for Hackathon:{' '}
            <Link to={`/hackathons/${team.hackathon._id}`} className="text-indigo-400 hover:underline">
              {team.hackathon.title}
            </Link>
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {isLeader ? (
            <Button variant="danger" onClick={handleDeleteTeam} loading={actionLoading} className="px-4 py-2 text-xs">
              <Trash2 className="h-4 w-4 mr-1.5" /> Delete Team
            </Button>
          ) : (
            <Button variant="danger" onClick={handleLeaveTeam} loading={actionLoading} className="px-4 py-2 text-xs">
              <LogOut className="h-4 w-4 mr-1.5" /> Leave Team
            </Button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-600/10 border border-red-500/20 text-red-400 text-sm rounded-lg flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Team Details & Invite Code */}
        <div className="space-y-6 lg:col-span-1">
          {/* Invite Code Card */}
          <Card className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Invite Members</h3>
            <p className="text-sm text-gray-300">Share this code with teammates to allow them to join your group:</p>
            <div className="flex items-center space-x-2 bg-[#0B0F19] border border-gray-800 rounded-lg p-3 justify-between">
              <span className="font-mono text-lg font-bold tracking-widest text-indigo-400 select-all">
                {team.inviteCode}
              </span>
              <button
                onClick={copyInviteCode}
                className="text-gray-400 hover:text-white transition p-1 hover:bg-gray-800 rounded-md"
                title="Copy Code"
              >
                {copied ? <Check className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
            <div className="text-[11px] text-gray-500">
              Note: Max team size for this hackathon is <span className="text-white font-bold">{team.hackathon.maxTeamSize}</span>.
            </div>
          </Card>

          {/* Registration Status Card */}
          <Card className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Registration Status</h3>
            <div className="flex items-center space-x-3.5">
              <span
                className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border ${
                  team.registrationStatus === 'approved'
                    ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400'
                    : team.registrationStatus === 'rejected'
                    ? 'bg-red-600/10 border-red-500/30 text-red-400'
                    : 'bg-yellow-600/10 border-yellow-500/30 text-yellow-400'
                }`}
              >
                {team.registrationStatus}
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              {team.registrationStatus === 'pending'
                ? 'Your registration is under review by organizers. Once approved, you can submit your project.'
                : team.registrationStatus === 'approved'
                ? 'Your registration has been approved! You are ready to build and submit your project.'
                : 'Your team registration was rejected. Contact organizer support.'}
            </p>
          </Card>

          {/* Transfer leadership (Leader Only) */}
          {isLeader && team.members.length > 1 && (
            <Card className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldAlert className="h-4.5 w-4.5 text-amber-500" />
                <span>Transfer Leadership</span>
              </h3>
              <form onSubmit={handleTransferLeadership} className="space-y-3">
                <select
                  value={newLeader}
                  onChange={(e) => setNewLeader(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="">Select teammate...</option>
                  {team.members
                    .filter((m) => m._id !== user?._id)
                    .map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name}
                      </option>
                    ))}
                </select>
                <Button type="submit" loading={actionLoading} className="w-full py-2 text-xs" variant="secondary">
                  Transfer Lead
                </Button>
              </form>
            </Card>
          )}
        </div>

        {/* Right Columns: Teammates & Submissions */}
        <div className="space-y-6 lg:col-span-2">
          {/* Members List */}
          <Card className="space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-2">Teammates</h3>
            <div className="divide-y divide-gray-800/60">
              {team.members.map((member) => {
                const isMemberLeader = team.leader._id === member._id;
                return (
                  <div key={member._id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3.5">
                      <div className="h-10 w-10 rounded-lg bg-gray-800 flex items-center justify-center font-bold text-indigo-400 text-sm">
                        {member.name[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-white">{member.name}</span>
                          {isMemberLeader && (
                            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-semibold">
                              Leader
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 block">{member.email}</span>
                      </div>
                    </div>

                    {isLeader && !isMemberLeader && (
                      <button
                        onClick={() => handleKickMember(member._id)}
                        className="text-red-400 hover:text-red-300 text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-red-500/10 transition"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Submission Module */}
          <Card className="space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-2">Project Submission</h3>
            {submission ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-bold text-indigo-400">{submission.projectName}</h4>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      submission.status === 'approved'
                        ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400'
                        : submission.status === 'rejected'
                        ? 'bg-red-600/10 border-red-500/30 text-red-400'
                        : 'bg-yellow-600/10 border-yellow-500/30 text-yellow-400'
                    }`}
                  >
                    {submission.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-300">
                  <p><strong className="text-white text-xs block uppercase tracking-wider mb-0.5">Problem</strong> {submission.problemStatement}</p>
                  <p><strong className="text-white text-xs block uppercase tracking-wider mb-0.5">Solution</strong> {submission.solution}</p>
                  {submission.techStack && submission.techStack.length > 0 && (
                    <div className="pt-2">
                      <strong className="text-white text-xs block uppercase tracking-wider mb-1">Tech Stack</strong>
                      <div className="flex flex-wrap gap-1.5">
                        {submission.techStack.map((tech, i) => (
                          <span key={i} className="text-[10px] bg-gray-800 text-gray-300 px-2 py-0.5 rounded border border-gray-700">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800/80">
                  {submission.githubUrl && (
                    <a href={submission.githubUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:underline">
                      GitHub Repository &rarr;
                    </a>
                  )}
                  {submission.demoUrl && (
                    <a href={submission.demoUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:underline">
                      Live Demo Link &rarr;
                    </a>
                  )}
                </div>

                {isLeader && new Date() <= new Date(team.hackathon.endDate) && (
                  <div className="pt-4 flex justify-end">
                    <Link to={`/teams/${id}/submit?edit=true`}>
                      <Button variant="outline" className="text-xs">
                        Edit Submission
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center space-y-4">
                <p className="text-gray-400 text-sm">No project has been submitted by your team yet.</p>
                {isApproved ? (
                  isLeader ? (
                    new Date() <= new Date(team.hackathon.endDate) ? (
                      <Link to={`/teams/${id}/submit`}>
                        <Button className="mx-auto flex items-center space-x-1 text-xs">
                          <Send className="h-4 w-4 mr-1" /> Submit Project Setup
                        </Button>
                      </Link>
                    ) : (
                      <p className="text-red-400 text-xs">The submission deadline has passed.</p>
                    )
                  ) : (
                    <p className="text-xs text-gray-500">Waiting for team leader to submit the project.</p>
                  )
                ) : (
                  <p className="text-xs text-yellow-500">You must be registration-approved to unlock project submission.</p>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
