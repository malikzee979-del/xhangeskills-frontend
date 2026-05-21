'use client';

import { useEffect, useState } from 'react';
import { skillApi, Skill } from '@/services/skillApi';
import { categoryApi, Category } from '@/services/categoryApi';
import Button from '@/components/Button';
import Link from 'next/link';
import { Search, Plus, Loader } from 'lucide-react';

export default function SkillsPage() {
  const [skills, setSkills] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [searchQuery, selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchQuery) params._q = searchQuery;
      if (selectedCategory) params['filters[category][id][$eq]'] = selectedCategory;

      const [skillsRes, categoriesRes] = await Promise.all([
        skillApi.getAll(params),
        categoryApi.getAll(),
      ]);

      setSkills(skillsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (err: any) {
      // ignore 404s or other conditions where empty data is fine
      if (err.status === 404) {
        setSkills([]);
        setCategories([]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Skills Marketplace</h1>
          <p className="text-gray-600 mt-2">Browse and discover skills from the community</p>
        </div>
        <Link href="/dashboard/skills?new=1">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Skill
          </Button>
        </Link>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Skills Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : skills.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No skills found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill) => (
            <Link key={skill.id} href={`/skills/${skill.id}`}>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition h-full">
                {skill.coverImageUrl && (
                  <img
                    src={skill.coverImageUrl}
                    alt={skill.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">{skill.title}</h3>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {skill.description}
                  </p>
                  {skill.category && (
                    <span className="inline-block mt-3 text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                      {skill.category.name}
                    </span>
                  )}
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-500">
                      by {skill.user?.username || 'Unknown'}
                    </span>
                    <Button size="sm">Request</Button>
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
