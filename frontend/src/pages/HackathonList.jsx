import React, { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';
import { Search, SlidersHorizontal, Calendar, Award, Tag, MapPin, Globe } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Link } from 'react-router-dom';

export default function HackathonList() {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState('all');
  const [status, setStatus] = useState('all');
  const [theme, setTheme] = useState('all');

  const themes = ['all', 'AI', 'Web3', 'FinTech', 'HealthTech', 'EdTech', 'Social Impact', 'Gaming', 'Cybersecurity'];

  const fetchHackathons = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (mode !== 'all') params.mode = mode;
      if (status !== 'all') params.status = status;
      if (theme !== 'all') params.theme = theme;

      const res = await api.get('/hackathons', { params });
      setHackathons(res.data.data);
    } catch (err) {
      console.error('Error fetching hackathons', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, [mode, status, theme]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHackathons();
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Explore Hackathons</h1>
        <p className="text-gray-400 mt-1">Discover, join teams, and compete in global building competitions.</p>
      </div>

      {/* Search and Filters Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="space-y-6">
            <div className="flex items-center space-x-2 text-white border-b border-gray-800 pb-3">
              <SlidersHorizontal className="h-5 w-5 text-indigo-400" />
              <span className="font-bold">Filters</span>
            </div>

            {/* Mode Filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Mode</label>
              <div className="flex flex-col space-y-2">
                {['all', 'online', 'offline'].map((m) => (
                  <label key={m} className="flex items-center space-x-2 text-sm text-gray-300 capitalize cursor-pointer">
                    <input
                      type="radio"
                      name="mode"
                      checked={mode === m}
                      onChange={() => setMode(m)}
                      className="accent-indigo-600 h-4 w-4"
                    />
                    <span>{m}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Timeline Status</label>
              <div className="flex flex-col space-y-2">
                {['all', 'upcoming', 'ongoing', 'completed'].map((s) => (
                  <label key={s} className="flex items-center space-x-2 text-sm text-gray-300 capitalize cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={status === s}
                      onChange={() => setStatus(s)}
                      className="accent-indigo-600 h-4 w-4"
                    />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Theme Filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Themes</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full bg-[#0B0F19] border border-gray-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-white outline-none capitalize"
              >
                {themes.map((t) => (
                  <option key={t} value={t} className="capitalize">
                    {t === 'all' ? 'All Themes' : t}
                  </option>
                ))}
              </select>
            </div>
            
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setMode('all');
                setStatus('all');
                setTheme('all');
              }}
              className="w-full text-xs"
            >
              Reset Filters
            </Button>
          </Card>
        </div>

        {/* Listings Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <Search className="h-4.5 w-4.5" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, theme, or tags..."
                className="w-full bg-[#111625] border border-gray-800 focus:border-indigo-500 rounded-lg pl-10.5 pr-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <Card key={n} className="h-72 animate-pulse bg-gray-800/20" />
              ))}
            </div>
          ) : hackathons.length === 0 ? (
            <Card className="text-center py-16 text-gray-400">
              No hackathons match your criteria. Try adjusting your search query or filters.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hackathons.map((h) => (
                <Card key={h._id} className="flex flex-col h-full overflow-hidden p-0">
                  <div className="relative">
                    <img
                      src={h.banner}
                      alt={h.title}
                      className="w-full h-40 object-cover border-b border-gray-800"
                    />
                    <div className="absolute top-3 right-3 flex space-x-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-indigo-600 px-2 py-0.5 rounded-full border border-gray-900 shadow-md">
                        {h.theme}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-gray-900 px-2 py-0.5 rounded-full border border-gray-800 shadow-md">
                        {h.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-white leading-tight line-clamp-1">{h.title}</h3>
                      <p className="text-gray-400 text-sm line-clamp-2">{h.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs text-gray-400 pt-2 border-t border-gray-800/80">
                      <div className="flex items-center space-x-1">
                        <Award className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="font-semibold text-white">${h.prizePool.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1 capitalize">
                        {h.mode === 'online' ? (
                          <>
                            <Globe className="h-3.5 w-3.5 text-indigo-400" />
                            <span>Online</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="h-3.5 w-3.5 text-purple-400" />
                            <span className="truncate">{h.venue || 'Offline'}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 col-span-2">
                        <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                        <span>Deadline: {formatDate(h.registrationDeadline)}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link to={`/hackathons/${h._id}`} className="block">
                        <Button variant="primary" className="w-full py-2 text-xs">
                          View details
                        </Button>
                      </Link>
                    </div>
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
