import React, { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';
import { Trophy, Award, Medal, Loader2, Sparkles, Filter } from 'lucide-react';
import Card from '../components/common/Card';

export default function Leaderboard() {
  const [hackathons, setHackathons] = useState([]);
  const [selectedHackId, setSelectedHackId] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  
  const [loadingList, setLoadingList] = useState(true);
  const [loadingBoard, setLoadingBoard] = useState(false);

  useEffect(() => {
    const fetchEventList = async () => {
      try {
        const res = await api.get('/hackathons');
        setHackathons(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedHackId(res.data.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to load events for leaderboard', err);
      } finally {
        setLoadingList(false);
      }
    };
    fetchEventList();
  }, []);

  useEffect(() => {
    const fetchRankings = async () => {
      if (!selectedHackId) return;
      setLoadingBoard(true);
      try {
        const res = await api.get(`/reviews/leaderboard/${selectedHackId}`);
        setLeaderboard(res.data.data);
      } catch (err) {
        console.error('Failed to load leaderboard statistics', err);
      } finally {
        setLoadingBoard(false);
      }
    };
    fetchRankings();
  }, [selectedHackId]);

  if (loadingList) {
    return <div className="text-center py-20 text-gray-400">Loading standings context...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center space-x-2">
            <Trophy className="h-7 w-7 text-indigo-400" />
            <span>Hackathon Leaderboards</span>
          </h1>
          <p className="text-gray-400 mt-1">Real-time standings compiled from evaluator rubrics.</p>
        </div>
        
        {/* Selector */}
        {hackathons.length > 0 && (
          <div className="flex items-center space-x-2 shrink-0">
            <Filter className="h-4.5 w-4.5 text-gray-500" />
            <select
              value={selectedHackId}
              onChange={(e) => setSelectedHackId(e.target.value)}
              className="bg-[#111625] border border-gray-800 focus:border-indigo-500 text-sm text-white rounded-lg px-3.5 py-2 outline-none transition cursor-pointer"
            >
              {hackathons.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {hackathons.length === 0 ? (
        <Card className="text-center py-16 text-gray-500">
          No hackathons are available on the platform to display rankings.
        </Card>
      ) : loadingBoard ? (
        <div className="py-20 flex justify-center items-center text-gray-500 space-x-2">
          <Loader2 className="animate-spin h-6 w-6 text-indigo-500" />
          <span>Calculating scores...</span>
        </div>
      ) : leaderboard.length === 0 ? (
        <Card className="text-center py-16 text-gray-400">
          No submissions have been evaluated for this hackathon yet. Leaderboard will update dynamically.
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Top 3 Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {/* Rank 2 */}
            {leaderboard[1] && (
              <Card className="order-2 md:order-1 text-center py-8 border-gray-800 bg-[#111625]/40 flex flex-col items-center space-y-3 relative">
                <Medal className="h-10 w-10 text-slate-300" />
                <div>
                  <h4 className="font-extrabold text-white text-lg">{leaderboard[1].teamName}</h4>
                  <p className="text-xs text-gray-500">{leaderboard[1].projectName}</p>
                </div>
                <span className="text-xs bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/10 font-bold">
                  Avg: {leaderboard[1].averageScore} Pts
                </span>
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-700 text-white font-extrabold text-xs px-2.5 py-0.5 rounded-full border border-gray-900">
                  Rank #2
                </span>
              </Card>
            )}

            {/* Rank 1 */}
            {leaderboard[0] && (
              <Card className="order-1 md:order-2 text-center py-10 border-indigo-500 bg-indigo-500/5 flex flex-col items-center space-y-4 relative shadow-indigo-500/5">
                <Trophy className="h-14 w-14 text-yellow-400 animate-pulse" />
                <div>
                  <h4 className="font-extrabold text-white text-xl flex items-center justify-center space-x-1">
                    <span>{leaderboard[0].teamName}</span>
                    <Sparkles className="h-4.5 w-4.5 text-yellow-400" />
                  </h4>
                  <p className="text-xs text-indigo-300">{leaderboard[0].projectName}</p>
                </div>
                <span className="text-sm bg-indigo-600 text-white px-4 py-1.5 rounded-full shadow font-extrabold">
                  Avg: {leaderboard[0].averageScore} Pts
                </span>
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white font-extrabold text-xs px-3.5 py-1 rounded-full border border-gray-950 shadow-md">
                  Winner 🥇
                </span>
              </Card>
            )}

            {/* Rank 3 */}
            {leaderboard[2] && (
              <Card className="order-3 text-center py-8 border-gray-800 bg-[#111625]/40 flex flex-col items-center space-y-3 relative">
                <Medal className="h-10 w-10 text-amber-600" />
                <div>
                  <h4 className="font-extrabold text-white text-lg">{leaderboard[2].teamName}</h4>
                  <p className="text-xs text-gray-500">{leaderboard[2].projectName}</p>
                </div>
                <span className="text-xs bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/10 font-bold">
                  Avg: {leaderboard[2].averageScore} Pts
                </span>
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-800 text-white font-extrabold text-xs px-2.5 py-0.5 rounded-full border border-gray-900">
                  Rank #3
                </span>
              </Card>
            )}
          </div>

          {/* Full List Table */}
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider bg-gray-900/40">
                    <th className="py-3.5 px-6">Rank</th>
                    <th className="py-3.5 px-6">Team Name</th>
                    <th className="py-3.5 px-6">Project Name</th>
                    <th className="py-3.5 px-6">Reviews Count</th>
                    <th className="py-3.5 px-6 text-right">Average Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {leaderboard.map((row) => (
                    <tr key={row.submissionId} className="hover:bg-gray-800/10 transition">
                      <td className="py-3.5 px-6 font-bold text-white">
                        {row.rank === 1 ? '🥇' : row.rank === 2 ? '🥈' : row.rank === 3 ? '🥉' : `#${row.rank}`}
                      </td>
                      <td className="py-3.5 px-6 font-semibold text-white">{row.teamName}</td>
                      <td className="py-3.5 px-6 text-gray-400">{row.projectName}</td>
                      <td className="py-3.5 px-6 font-mono text-xs">{row.reviewsCount}</td>
                      <td className="py-3.5 px-6 text-right font-bold text-indigo-400">{row.averageScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
