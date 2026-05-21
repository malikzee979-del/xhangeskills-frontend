'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { skillApi, Skill } from '@/services/skillApi';
import { categoryApi, Category } from '@/services/categoryApi';
import Link from 'next/link';
import { Search, Plus, Loader, Star, User } from 'lucide-react';

export default function SkillsMarketplacePage() {
  const searchParams = useSearchParams();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => { loadData(); }, [searchQuery, selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = { 'filters[status][$eq]': 'approved', populate: '*' };
      if (searchQuery) params._q = searchQuery;
      if (selectedCategory) params['filters[category][id][$eq]'] = selectedCategory;

      const [skillsRes, categoriesRes] = await Promise.all([
        skillApi.getAll(params),
        categoryApi.getAll(),
      ]);
      setSkills((skillsRes as any).data || []);
      setCategories((categoriesRes as any).data || []);
    } catch (err) {
      // Error loading skills - silently continue
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Skills Marketplace</h1>
          <p className="text-sm text-gray-500 mt-1">Browse and discover skills from the community</p>
        </div>
        <Link
          href="/dashboard/skills?new=1"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          Offer a Skill
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by skill name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="py-2 px-3 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition sm:w-48"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Active filters */}
        {(searchQuery || selectedCategory) && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">Filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-blue-900 ml-0.5">×</button>
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                {categories.find((c) => c.id === selectedCategory)?.name}
                <button onClick={() => setSelectedCategory('')} className="hover:text-blue-900 ml-0.5">×</button>
              </span>
            )}
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory(''); }}
              className="ml-auto text-xs text-gray-400 hover:text-gray-600 transition"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-gray-500">
          {skills.length === 0 ? 'No skills found' : `${skills.length} skill${skills.length !== 1 ? 's' : ''} found`}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-500">Loading skills...</p>
        </div>
      ) : skills.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200 gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-900">No skills found</p>
            <p className="text-sm text-gray-500 mt-1">Try different keywords or clear your filters</p>
          </div>
          {(searchQuery || selectedCategory) && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory(''); }}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {skills.map((skill) => (
            <Link key={skill.id} href={`/skills/${skill.id}`} className="group block">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all duration-200 h-full flex flex-col">
                {/* Cover image */}
                <div className="relative h-44 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
                  {skill.coverImageUrl ? (
                    <img
                      src={skill.coverImageUrl}
                      alt={skill.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-5xl font-bold text-blue-200 select-none">
                        {skill.title[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  {skill.category && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                      {skill.category.name}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {skill.title}
                  </h3>
                  {skill.description && (
                    <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed flex-1">
                      {skill.description}
                    </p>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-[10px]">
                        {(skill.user?.displayName || skill.user?.username || 'U')[0].toUpperCase()}
                      </div>
                      <span className="truncate max-w-[80px]">
                        {skill.user?.displayName || skill.user?.username || 'Unknown'}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 group-hover:underline">
                      View →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
