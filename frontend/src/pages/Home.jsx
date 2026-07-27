import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { Rocket, Trophy, Users, Code, Award, ChevronRight, Star } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

export default function Home() {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/hackathons');
        // Get top 3 upcoming/ongoing hackathons
        setHackathons(res.data.data.slice(0, 3));
      } catch (err) {
        console.error('Error fetching featured hackathons', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const stats = [
    { label: 'Active Hackathons', value: '15+', icon: Trophy, color: 'text-indigo-400' },
    { label: 'Global Developers', value: '10,000+', icon: Users, color: 'text-purple-400' },
    { label: 'Prizes Awarded', value: '$250k+', icon: Award, color: 'text-pink-400' },
    { label: 'Projects Built', value: '2,400+', icon: Code, color: 'text-teal-400' }
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-full text-xs font-semibold border border-indigo-500/20">
            <Star className="h-3 w-3 fill-indigo-400" />
            <span>Discover the Future of Hackathons</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Build the Future. <br className="hidden md:block"/>
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              One Line of Code
            </span>{' '}
            at a Time.
          </h1>
          
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Innovate, collaborate, and compete in global hackathons. HackMatrix connects organizers, participants, and judges on a single platform.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <Link to="/hackathons">
              <Button className="w-full sm:w-auto px-8 py-3.5 text-base">
                Browse Hackathons <ChevronRight className="ml-1 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline" className="w-full sm:w-auto px-8 py-3.5 text-base">
                Join the Platform
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="text-center space-y-2 flex flex-col items-center">
                <div className={`p-3 bg-gray-800/40 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white pt-2">{stat.value}</h3>
                <p className="text-gray-400 text-xs md:text-sm">{stat.label}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Featured Hackathons */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Featured Hackathons</h2>
            <p className="text-gray-400 text-sm mt-1">Check out the most anticipated coding events and register today.</p>
          </div>
          <Link to="/hackathons" className="text-indigo-400 hover:text-indigo-300 font-medium text-sm flex items-center space-x-1">
            <span>View All</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="h-80 animate-pulse bg-gray-800/20" />
            ))}
          </div>
        ) : hackathons.length === 0 ? (
          <Card className="text-center py-12 text-gray-400">
            No hackathons listed yet. Create one or check back later!
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hackathons.map((h) => (
              <Card key={h._id} className="flex flex-col h-full overflow-hidden p-0">
                <img
                  src={h.banner}
                  alt={h.title}
                  className="w-full h-44 object-cover border-b border-gray-800"
                />
                <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-indigo-400 font-semibold uppercase tracking-wider">{h.theme}</span>
                      <span className="text-gray-400 bg-gray-800 px-2 py-0.5 rounded capitalize">{h.mode}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white line-clamp-1">{h.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{h.description}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-gray-400 text-xs block uppercase">Prize Pool</span>
                      <span className="text-emerald-400 font-bold">${h.prizePool.toLocaleString()}</span>
                    </div>
                    <Link to={`/hackathons/${h._id}`}>
                      <Button variant="outline" className="px-3 py-1.5 text-xs">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Why Participate Section */}
      <section className="bg-gradient-to-b from-transparent to-[#0B0F19]/40 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Why Join HackMatrix?</h2>
            <p className="text-gray-400 text-sm">
              We offer a seamless end-to-end framework built for tech enthusiasts, students, and coordinators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="h-12 w-12 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/20">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Collaborative Team Building</h3>
              <p className="text-gray-400 text-sm">
                Create teams, invite friends using simple invitation codes, and work together on solving challenges.
              </p>
            </div>
            <div className="space-y-3">
              <div className="h-12 w-12 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center border border-purple-500/20">
                <Code className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Centralized Submissions</h3>
              <p className="text-gray-400 text-sm">
                Submit repositories, live demo URLs, screenshots, and presentation PDFs directly on your dashboard.
              </p>
            </div>
            <div className="space-y-3">
              <div className="h-12 w-12 bg-pink-500/10 text-pink-400 rounded-xl flex items-center justify-center border border-pink-500/20">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Fair Judging Rubric</h3>
              <p className="text-gray-400 text-sm">
                Submissions are graded transparently based on customizable criteria with public ranking leaderboards.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
