'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { skillApi, Skill } from '@/services/skillApi';
import { categoryApi, Category } from '@/services/categoryApi';
import Link from 'next/link';
import { Search, Plus, Loader } from 'lucide-react';

export default function SkillsMarketplacePage() {
  const searchParams = useSearchParams();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    loadData();
  }, [searchQuery, selectedCategory]);

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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-content">Skills Marketplace</h1>
          <p className="mt-1 text-sm text-muted">Browse and discover skills from the community</p>
        </div>
        <Link href="/dashboard/skills?new=1" className="btn btn-primary shrink-0 px-4 py-2 text-sm">
          <Plus className="h-4 w-4" />
          Offer a Skill
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              type="text"
              placeholder="Search by skill name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="field w-full py-2 pl-9 pr-4 text-sm"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="field py-2 px-3 text-sm sm:w-48"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Active filters */}
        {(searchQuery || selectedCategory) && (
          <div className="mt-3 flex items-center gap-2 border-t border-line pt-3">
            <span className="text-xs text-subtle">Filters:</span>
            {searchQuery && (
              <span className="badge bg-accent-soft px-2 py-0.5 text-xs text-accent">
                &quot;{searchQuery}&quot;
                <button onClick={() => setSearchQuery('')} className="ml-0.5 hover:opacity-70">
                  ×
                </button>
              </span>
            )}
            {selectedCategory && (
              <span className="badge bg-accent-soft px-2 py-0.5 text-xs text-accent">
                {categories.find((c) => c.id === selectedCategory)?.name}
                <button onClick={() => setSelectedCategory('')} className="ml-0.5 hover:opacity-70">
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
              }}
              className="ml-auto text-xs text-subtle transition hover:text-muted"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-muted">
          {skills.length === 0
            ? 'No skills found'
            : `${skills.length} skill${skills.length !== 1 ? 's' : ''} found`}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Loader className="h-8 w-8 animate-spin text-accent" />
          <p className="text-sm text-muted">Loading skills...</p>
        </div>
      ) : skills.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-4 py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-2">
            <Search className="h-8 w-8 text-subtle" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-content">No skills found</p>
            <p className="mt-1 text-sm text-muted">Try different keywords or clear your filters</p>
          </div>
          {(searchQuery || selectedCategory) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
              }}
              className="btn btn-primary px-4 py-2 text-sm"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {skills.map((skill) => (
            <Link key={skill.id} href={`/skills/${skill.id}`} className="group block">
              <div className="card card-hover flex h-full flex-col overflow-hidden">
                {/* Cover image */}
                <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[var(--accent-soft)] to-[var(--accent-2-soft)]">
                  {skill.coverImageUrl ? (
                    <img
                      src={skill.coverImageUrl}
                      alt={skill.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="select-none text-5xl font-bold text-accent/30">
                        {skill.title[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  {skill.category && (
                    <span className="badge absolute left-2 top-2 border border-line bg-surface/90 px-2 py-0.5 text-xs font-semibold text-accent backdrop-blur-sm">
                      {skill.category.name}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-content transition-colors group-hover:text-accent">
                    {skill.title}
                  </h3>
                  {skill.description && (
                    <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-muted">
                      {skill.description}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted">
                      <div className="brand-mark flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-on-accent">
                        {(skill.user?.displayName || skill.user?.username || 'U')[0].toUpperCase()}
                      </div>
                      <span className="max-w-[80px] truncate">
                        {skill.user?.displayName || skill.user?.username || 'Unknown'}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-accent group-hover:underline">View →</span>
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
