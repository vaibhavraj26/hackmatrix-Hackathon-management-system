import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../context/AuthContext';
import { Award, FileCode, CheckCircle, ArrowLeft, AlertTriangle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

export default function EvaluateSubmission() {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Scoring inputs
  const [scores, setScores] = useState({}); // { 'Innovation': 8, 'UI/UX': 9 }
  const [feedback, setFeedback] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      try {
        const subRes = await api.get(`/submissions/${submissionId}`);
        const sub = subRes.data.data;
        setSubmission(sub);

        // Fetch existing review if it exists
        try {
          const revRes = await api.get(`/reviews/submission/${submissionId}`);
          // Find review by this judge (the logged in judge user id is retrieved on backend, but let's check)
          const myRev = revRes.data.data.find(r => r.judge?._id || r.judge);
          if (myRev) {
            setFeedback(myRev.feedback || '');
            const initialScores = {};
            myRev.scores.forEach(s => {
              initialScores[s.criterionName] = s.score;
            });
            setScores(initialScores);
          }
        } catch (err) {
          console.log('No existing review found or failed to fetch', err);
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Failed to load submission details');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissionDetails();
  }, [submissionId]);

  const handleScoreChange = (criterionName, value, maxScore) => {
    const val = Number(value);
    if (val < 0 || val > maxScore) return;
    
    setScores({
      ...scores,
      [criterionName]: val
    });
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Prepare scores array
    const scoresArray = submission.hackathon.judgingCriteria.map((c) => {
      const score = scores[c.name] !== undefined ? scores[c.name] : 0;
      return {
        criterionName: c.name,
        score
      };
    });

    setSubmitLoading(true);
    try {
      await api.post('/reviews', {
        submissionId,
        scores: scoresArray,
        feedback
      });
      navigate('/judge-dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit evaluation');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading project evaluation...</div>;

  if (!submission) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>Submission not found.</p>
        <button onClick={() => navigate('/judge-dashboard')} className="text-indigo-400 underline mt-4">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const hackathon = submission.hackathon;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      
      {/* Header */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => navigate('/judge-dashboard')}
          className="text-gray-400 hover:text-white transition flex items-center text-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </button>
      </div>

      <div className="flex justify-between items-start border-b border-gray-800 pb-6">
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest block">Project Grading</span>
          <h1 className="text-3xl font-extrabold text-white">{submission.projectName}</h1>
          <p className="text-gray-400 text-sm mt-1">Hackathon: {hackathon.title} | Team: {submission.team?.name}</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-600/10 border border-red-500/20 text-red-400 text-sm rounded-lg flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Project Submission Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-2">Project Artifacts</h3>
            
            <div className="space-y-3.5 text-sm text-gray-300">
              <div>
                <strong className="text-white text-xs block uppercase tracking-wider mb-0.5">Problem Statement</strong>
                <p className="leading-relaxed bg-[#0B0F19] p-3 rounded-lg border border-gray-800">{submission.problemStatement}</p>
              </div>

              <div>
                <strong className="text-white text-xs block uppercase tracking-wider mb-0.5">Solution Description</strong>
                <p className="leading-relaxed bg-[#0B0F19] p-3 rounded-lg border border-gray-800">{submission.solution}</p>
              </div>

              {submission.description && (
                <div>
                  <strong className="text-white text-xs block uppercase tracking-wider mb-0.5">Additional Context</strong>
                  <p className="leading-relaxed bg-[#0B0F19] p-3 rounded-lg border border-gray-800">{submission.description}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-800/80 flex flex-wrap gap-4 text-xs">
              <a href={submission.githubUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">
                GitHub Repository &rarr;
              </a>
              {submission.demoUrl && (
                <a href={submission.demoUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">
                  Live URL &rarr;
                </a>
              )}
              {submission.presentationUrl && (
                <a href={submission.presentationUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">
                  Presentation Deck &rarr;
                </a>
              )}
              {submission.videoUrl && (
                <a href={submission.videoUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">
                  Video Demo &rarr;
                </a>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Score Sheet Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmitEvaluation}>
            <Card className="space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-2 flex items-center space-x-1.5">
                <Award className="h-5 w-5 text-indigo-400" />
                <span>Score Sheet</span>
              </h3>

              <div className="space-y-4">
                {hackathon.judgingCriteria.map((c) => {
                  const currentScore = scores[c.name] !== undefined ? scores[c.name] : '';
                  return (
                    <div key={c._id} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        <span>{c.name}</span>
                        <span>Max: {c.maxScore}</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max={c.maxScore}
                        required
                        value={currentScore}
                        onChange={(e) => handleScoreChange(c.name, e.target.value, c.maxScore)}
                        placeholder={`0 - ${c.maxScore}`}
                        className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-white outline-none transition"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="space-y-1.5 pt-2">
                <label htmlFor="feed" className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                  Feedback comments
                </label>
                <textarea
                  id="feed"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share feedback on technical choices, UI layout, or innovation depth..."
                  rows={4}
                  className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none transition resize-none"
                />
              </div>

              <Button type="submit" loading={submitLoading} className="w-full py-2.5">
                <CheckCircle className="h-4.5 w-4.5 mr-1.5" /> Submit Evaluation
              </Button>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
