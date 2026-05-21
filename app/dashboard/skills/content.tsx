'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Filter, Search, Zap, Pencil, Trash, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { skillApi, Skill } from '@/services/skillApi';
import { formatErrorForDisplay } from '@/services/errorUtils';
import CreateSkillDialog from '@/components/CreateSkillDialog';
import Link from 'next/link';

const getStatusBadge = (status: string) => {
  const map = {
    pending:  { icon: Clock,         bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending'  },
    approved: { icon: CheckCircle,   bg: 'bg-green-100',  text: 'text-green-800',  label: 'Approved' },
    rejected: { icon: AlertCircle,   bg: 'bg-red-100',    text: 'text-red-800',    label: 'Rejected' },
  };
  return map[status as keyof typeof map] ?? map.pending;
};

const StatusBadge = ({ status }: { status: string }) => {
  const badge = getStatusBadge(status);
  const Icon = badge.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${badge.bg} ${badge.text}`}>
      <Icon className="w-3 h-3" />
      {badge.label}
    </span>
  );
};

export default function SkillsPageContent() {
  const [skills, setSkills]               = useState<Skill[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [searchQuery, setSearchQuery]     = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy]               = useState('name');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const searchParams = useSearchParams();

  const categories = [
    'all',
    ...Array.from(new Set(skills.map((s) => s.category?.name || '').filter(Boolean))),
  ];

  const filteredSkills = skills
    .filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        s.title.toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q);
      const matchCat = filterCategory === 'all' || s.category?.name === filterCategory;
      return matchSearch && matchCat;
    })
    .sort((a, b) => (sortBy === 'name' ? a.title.localeCompare(b.title) : 0));

  const loadSkills = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // /skills/me is authenticated — Strapi returns only the current user's skills
      const response = (await skillApi.getMe()) as { data?: Skill[] };
      setSkills(response?.data ?? []);
    } catch (err) {
      const e = err as { status?: number };
      if (e?.status !== 404) {
        const msg = formatErrorForDisplay(err);
        if (msg) setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load once on mount
  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  // Open dialog when ?new=1 is in the URL
  useEffect(() => {
    if (searchParams?.get('new') === '1') setShowCreateDialog(true);
  }, [searchParams]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    try {
      await skillApi.delete(id);
      loadSkills();
    } catch (err) {
      const msg = formatErrorForDisplay(err);
      if (msg) setError(msg);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Skills</h1>
            <p className="text-gray-600 mt-2">Manage and showcase your skills to the community</p>
          </div>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Add New Skill
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Search & Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search skills by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4 flex-wrap">
            <div className="flex gap-2 items-center flex-wrap">
              <Filter className="w-4 h-4 text-gray-600" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${
                    filterCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            <div className="ml-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bookshelf Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredSkills.length === 0 ? (
        <div className="text-center py-16">
          <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold text-lg">No skills found</p>
          <p className="text-gray-500 mt-2">Try adjusting your filters or add a new skill</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pb-12">
          {filteredSkills.map((skill) => (
            <div key={skill.id} className="group cursor-pointer">
              <div className="relative h-64 mb-3 transition transform group-hover:scale-105">
                <div className="relative h-full w-full rounded-lg overflow-hidden shadow-lg group-hover:shadow-2xl transition border-2 border-gray-200">
                  <img
                    src={skill.coverImageUrl || '/logo.jfif'}
                    alt={skill.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition duration-300">
                    <p className="text-xs opacity-90 line-clamp-2">{skill.description}</p>
                  </div>
                </div>
                <div className="absolute -right-1 top-0 bottom-0 w-1 bg-black/20 rounded-r-lg" />
              </div>

              <div className="px-1 relative">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition">
                  {skill.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {skill.category?.name || skill.baseSkill?.name || ''}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <StatusBadge status={skill.status} />
                  <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <Link href={`/skills/${skill.id}/edit`}>
                      <button className="p-1 bg-white rounded-full hover:bg-gray-100">
                        <Pencil className="w-4 h-4 text-gray-600" />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(String(skill.id))}
                      className="p-1 bg-white rounded-full hover:bg-gray-100"
                    >
                      <Trash className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-gray-600 text-sm">Total Skills</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{skills.length}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-gray-600 text-sm">Approved</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {skills.filter((s) => s.status === 'approved').length}
            </p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-gray-600 text-sm">Pending Review</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {skills.filter((s) => s.status === 'pending').length}
            </p>
          </div>
        </div>
      </div>

      {showCreateDialog && (
        <CreateSkillDialog
          onClose={() => {
            setShowCreateDialog(false);
            loadSkills();
          }}
        />
      )}
    </div>
  );
}
