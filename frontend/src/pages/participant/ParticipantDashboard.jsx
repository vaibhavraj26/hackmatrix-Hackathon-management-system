import React, { useEffect, useState } from 'react';
import { useAuth, api } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Code, Trophy, Users, Calendar, ArrowRight, ExternalLink, Award } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

export default function ParticipantDashboard() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParticipantData = async () => {
      try {
        const res = await api.get('/teams/my');
        setTeams(res.data.data);
      } catch (err) {
        console.error('Failed to load my teams info', err);
      } finally {
        setLoading(false);
      }
    };
    fetchParticipantData();
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-[#111625] border border-gray-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block">Dashboard</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">Welcome back, {user?.name}!</h1>
          <p className="text-gray-400 text-sm max-w-lg">
            Review your teams, monitor project approval statuses, and explore upcoming hackathons.
          </p>
        </div>
        <Link to="/hackathons" className="shrink-0">
          <Button className="flex items-center space-x-1">
            <span>Explore Hackathons</span>
            <ArrowRight className="h-4.5 w-4.5" />
          </Button>
        </Link>
      </div>

      {/* Grid of registered teams */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Users className="h-5.5 w-5.5 text-indigo-400" />
          <span>My Teams & Registrations</span>
        </h2>

        {teams.length === 0 ? (
          <Card className="text-center py-16 space-y-4">
            <Trophy className="h-10 w-10 text-gray-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-md font-bold text-white">No active registrations</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                You have not registered for any events yet. Join or create a team to participate.
              </p>
            </div>
            <Link to="/hackathons" className="inline-block">
              <Button variant="outline" className="text-xs">
                Browse Hackathons
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teams.map((t) => (
              <Card key={t._id} className="flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest block">Team Name</span>
                      <h3 className="text-lg font-bold text-white leading-snug">{t.name}</h3>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      t.registrationStatus === 'approved'
                        ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400'
                        : t.registrationStatus === 'rejected'
                        ? 'bg-red-600/10 border-red-500/20 text-red-400'
                        : 'bg-yellow-600/10 border-yellow-500/20 text-yellow-400'
                    }`}>
                      {t.registrationStatus}
                    </span>
                  </div>
                  
                  <div className="p-3 bg-[#0B0F19] rounded-lg border border-gray-800 space-y-1 text-xs">
                    <span className="text-gray-500 block uppercase font-semibold text-[10px]">Hackathon</span>
                    <Link to={`/hackathons/${t.hackathon?._id}`} className="text-white hover:text-indigo-400 font-bold flex items-center space-x-0.5">
                      <span>{t.hackathon?.title}</span>
                      <ExternalLink className="h-3 w-3 shrink-0 text-gray-500" />
                    </Link>
                    <span className="text-gray-400 block pt-1">
                      Deadline: {new Date(t.hackathon?.registrationDeadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-xs text-gray-400">
                    <Users className="h-4 w-4 text-indigo-400" />
                    <span>{t.members?.length || 1} Members</span>
                  </div>
                  <Link to={`/teams/${t._id}`}>
                    <Button variant="secondary" className="px-4 py-1.5 text-xs">
                      Enter Workspace
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
