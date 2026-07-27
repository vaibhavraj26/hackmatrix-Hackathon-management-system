import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import HackathonList from './pages/HackathonList';
import HackathonDetail from './pages/HackathonDetail';
import TeamPage from './pages/TeamPage';
import SubmissionPage from './pages/SubmissionPage';
import Leaderboard from './pages/Leaderboard';
import NotFound from './pages/NotFound';

// Dashboards
import AdminDashboard from './pages/admin/AdminDashboard';
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import ParticipantDashboard from './pages/participant/ParticipantDashboard';
import JudgeDashboard from './pages/judge/JudgeDashboard';
import EvaluateSubmission from './pages/judge/EvaluateSubmission';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading auth state...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Redirect logged in users away from auth pages
const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading auth state...</div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-[#070A13]">
          <Navbar />
          
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/hackathons" element={<HackathonList />} />
              <Route path="/hackathons/:id" element={<HackathonDetail />} />
              <Route path="/leaderboard" element={<Leaderboard />} />

              {/* Auth Routes */}
              <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
              <Route path="/signup" element={<AuthRoute><Signup /></AuthRoute>} />

              {/* Protected Routes */}
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              
              {/* Team Workspace routes */}
              <Route path="/teams/:id" element={<ProtectedRoute><TeamPage /></ProtectedRoute>} />
              <Route path="/teams/:teamId/submit" element={
                <ProtectedRoute allowedRoles={['participant']}><SubmissionPage /></ProtectedRoute>
              } />

              {/* Dashboards */}
              <Route path="/admin-dashboard" element={
                <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
              } />
              
              <Route path="/organizer-dashboard" element={
                <ProtectedRoute allowedRoles={['organizer', 'admin']}><OrganizerDashboard /></ProtectedRoute>
              } />
              
              <Route path="/participant-dashboard" element={
                <ProtectedRoute allowedRoles={['participant']}><ParticipantDashboard /></ProtectedRoute>
              } />
              
              <Route path="/judge-dashboard" element={
                <ProtectedRoute allowedRoles={['judge']}><JudgeDashboard /></ProtectedRoute>
              } />
              
              <Route path="/judge/evaluate/:submissionId" element={
                <ProtectedRoute allowedRoles={['judge']}><EvaluateSubmission /></ProtectedRoute>
              } />

              {/* Error Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
