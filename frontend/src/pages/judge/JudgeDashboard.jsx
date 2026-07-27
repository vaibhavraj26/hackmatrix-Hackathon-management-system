import React, { useEffect, useState } from 'react';
import { api } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Award, FileCode, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

export default function JudgeDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        const res = await api.get('/reviews/assigned');
        setSubmissions(res.data.data);
      } catch (err) {
        console.error('Failed to load judge assignments', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssigned();
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading assignments...</div>;

  const pendingList = submissions.filter((s) => !s.evaluated);
  const completedList = submissions.filter((s) => s.evaluated);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center space-x-2">
          <Award className="h-7 w-7 text-indigo-400" />
          <span>Judge Panel</span>
        </h1>
        <p className="text-gray-400 mt-1">Review, score, and provide comments on assigned project submissions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Stats Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <Card className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Evaluation Stats</h3>
            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-sm border-b border-gray-800 pb-2">
                <span className="text-gray-400 flex items-center"><Clock className="h-4 w-4 mr-1.5 text-yellow-400" /> Pending</span>
                <span className="font-bold text-white">{pendingList.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 flex items-center"><CheckCircle className="h-4 w-4 mr-1.5 text-emerald-400" /> Evaluated</span>
                <span className="font-bold text-white">{completedList.length}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Submissions List */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white">Assigned Submissions</h2>
          
          {submissions.length === 0 ? (
            <Card className="text-center py-16 text-gray-500">
              No hackathon submissions have been allocated to you for evaluation.
            </Card>
          ) : (
            <div className="space-y-4">
              {submissions.map((sub) => (
                <Card key={sub._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-indigo-400 font-semibold">{sub.hackathon?.title}</span>
                      <span className="text-gray-600">&bull;</span>
                      <span className="text-gray-400">Team: {sub.team?.name}</span>
                    </div>
                    <h3 className="text-md font-bold text-white">{sub.projectName}</h3>
                    <div className="flex space-x-4 text-xs text-indigo-400">
                      <a href={sub.githubUrl} target="_blank" rel="noreferrer" className="hover:underline flex items-center">
                        Code Repository <ExternalLink className="h-3 w-3 ml-0.5" />
                      </a>
                      {sub.demoUrl && (
                        <a href={sub.demoUrl} target="_blank" rel="noreferrer" className="hover:underline flex items-center">
                          Demo Link <ExternalLink className="h-3 w-3 ml-0.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center space-x-4">
                    {sub.evaluated ? (
                      <div className="text-right flex items-center space-x-3">
                        <div>
                          <span className="text-[10px] text-gray-500 block uppercase font-semibold">Your Score</span>
                          <span className="text-sm font-extrabold text-emerald-400">{sub.score} Pts</span>
                        </div>
                        <Link to={`/judge/evaluate/${sub._id}`}>
                          <Button variant="outline" className="px-3 py-1.5 text-xs">
                            Edit Scores
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <Link to={`/judge/evaluate/${sub._id}`}>
                        <Button className="px-4 py-2 text-xs">
                          Evaluate Project
                        </Button>
                      </Link>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
