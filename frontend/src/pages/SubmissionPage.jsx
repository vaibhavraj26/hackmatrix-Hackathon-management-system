import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import { Send, Terminal, AlertTriangle, Code, ArrowLeft } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

export default function SubmissionPage() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditing = searchParams.get('edit') === 'true';

  const [projectName, setProjectName] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [solution, setSolution] = useState('');
  const [description, setDescription] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [techStackText, setTechStackText] = useState('');
  const [presentationUrl, setPresentationUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [screenshotsText, setScreenshotsText] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submissionId, setSubmissionId] = useState('');

  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const teamRes = await api.get(`/teams/${teamId}`);
        const team = teamRes.data.data;

        if (isEditing) {
          const subRes = await api.get(`/submissions/hackathon/${team.hackathon._id}`);
          const existingSub = subRes.data.data.find(sub => sub.team && sub.team._id === teamId);
          if (existingSub) {
            setSubmissionId(existingSub._id);
            setProjectName(existingSub.projectName || '');
            setProblemStatement(existingSub.problemStatement || '');
            setSolution(existingSub.solution || '');
            setDescription(existingSub.description || '');
            setGithubUrl(existingSub.githubUrl || '');
            setDemoUrl(existingSub.demoUrl || '');
            setTechStackText(existingSub.techStack?.join(', ') || '');
            setPresentationUrl(existingSub.presentationUrl || '');
            setVideoUrl(existingSub.videoUrl || '');
            setScreenshotsText(existingSub.screenshots?.join(', ') || '');
          }
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Failed to load team context.');
      } finally {
        setLoading(false);
      }
    };
    fetchExistingData();
  }, [teamId, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!projectName || !problemStatement || !solution || !githubUrl) {
      setErrorMsg('Please fill in all required fields');
      return;
    }

    setSubmitLoading(true);
    
    const techStack = techStackText
      ? techStackText.split(',').map(t => t.trim()).filter(t => t !== '')
      : [];

    const screenshots = screenshotsText
      ? screenshotsText.split(',').map(s => s.trim()).filter(s => s !== '')
      : [];

    const data = {
      teamId,
      projectName,
      problemStatement,
      solution,
      description,
      githubUrl,
      demoUrl,
      techStack,
      presentationUrl,
      videoUrl,
      screenshots
    };

    try {
      if (isEditing && submissionId) {
        await api.put(`/submissions/${submissionId}`, data);
      } else {
        await api.post('/submissions', data);
      }
      navigate(`/teams/${teamId}`);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit project');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading form context...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => navigate(`/teams/${teamId}`)}
          className="text-gray-400 hover:text-white transition flex items-center text-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Team
        </button>
      </div>

      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center space-x-2">
          <Code className="h-7 w-7 text-indigo-400" />
          <span>{isEditing ? 'Edit Project Submission' : 'Submit Project'}</span>
        </h1>
        <p className="text-gray-400 mt-1">
          {isEditing
            ? 'Alter submission fields before the hackathon final coding phase concludes.'
            : 'Fill in your project repository link, theme solution, and presentation artifacts.'}
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-600/10 border border-red-500/20 text-red-400 text-sm rounded-lg flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-2">Core Details</h3>
          
          <div className="space-y-1.5">
            <label htmlFor="pname" className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              id="pname"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. HealthChain"
              required
              className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="problem" className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              Problem Statement <span className="text-red-500">*</span>
            </label>
            <textarea
              id="problem"
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              placeholder="What specific issue does your project solve?"
              rows={3}
              required
              className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="solution" className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              Solution <span className="text-red-500">*</span>
            </label>
            <textarea
              id="solution"
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              placeholder="Describe your technical architecture and solution details..."
              rows={4}
              required
              className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="desc" className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              Additional Description
            </label>
            <textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Features, database designs, or APIs used..."
              rows={4}
              className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition resize-none"
            />
          </div>
        </Card>

        <Card className="space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-2">Technical References</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="github" className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                GitHub Repository Link <span className="text-red-500">*</span>
              </label>
              <input
                id="github"
                type="text"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username/repo"
                required
                className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="demo" className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                Live Demo Link
              </label>
              <input
                id="demo"
                type="text"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://myproject.vercel.app"
                className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="tech" className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center space-x-1">
              <Terminal className="h-4 w-4 text-teal-400" />
              <span>Tech Stack (Comma Separated)</span>
            </label>
            <input
              id="tech"
              type="text"
              value={techStackText}
              onChange={(e) => setTechStackText(e.target.value)}
              placeholder="e.g. Next.js, Node.js, Prisma, PostgreSQL"
              className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition"
            />
          </div>
        </Card>

        <Card className="space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-2">Media & Presentations</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="pdf" className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                Presentation PDF Link
              </label>
              <input
                id="pdf"
                type="text"
                value={presentationUrl}
                onChange={(e) => setPresentationUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="video" className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                Demo Video Link
              </label>
              <input
                id="video"
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/..."
                className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="screenshots" className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              Screenshot Image URLs (Comma Separated)
            </label>
            <input
              id="screenshots"
              type="text"
              value={screenshotsText}
              onChange={(e) => setScreenshotsText(e.target.value)}
              placeholder="https://example.com/img1.png, https://example.com/img2.png"
              className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition"
            />
          </div>
        </Card>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => navigate(`/teams/${teamId}`)}>
            Cancel
          </Button>
          <Button type="submit" loading={submitLoading} className="px-8">
            <Send className="h-4.5 w-4.5 mr-1.5" />
            {isEditing ? 'Save Changes' : 'Submit Project'}
          </Button>
        </div>
      </form>
    </div>
  );
}
