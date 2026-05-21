'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import StatCard from './components/StatCard';
import { useAuth } from '@/hooks/useAuth';
import { apiClient, safeRequest } from '@/services/apiClient';
import { Zap, Send, TrendingUp, Star, Clock, Award, Loader } from 'lucide-react';

export default function DashboardPage() {
  const { loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    mySkills: 0,
    requestsSent: 0,
    requestsReceived: 0,
    pendingRequests: 0,
    averageRating: '0.0',
    totalExchanges: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only start loading dashboard data after auth is complete
    if (!authLoading) {
      loadDashboardData();
    }
  }, [authLoading]);

  const loadDashboardData = async () => {
    try {
      const [countsRes] = await Promise.all([
        safeRequest(apiClient.get('/dashboard/counts')),
      ]);

      // Backend returns { data: { mySkills, ... } }
      const counts = countsRes?.data || countsRes || {};

      setStats({
        mySkills: counts.mySkills ?? 0,
        requestsSent: counts.requestsSent ?? 0,
        requestsReceived: counts.requestsReceived ?? 0,
        pendingRequests: counts.pendingRequests ?? 0,
        averageRating: counts.averageRating != null ? String(Number(counts.averageRating).toFixed(1)) : '0.0',
        totalExchanges: counts.totalExchanges ?? 0,
      });
    } catch (err: any) {
      // Error loading dashboard data - silently continue
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here's your skill exchange overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard icon={<Zap className="w-6 h-6" />} label="My Skills" value={stats.mySkills} color="blue" />
        <StatCard icon={<Send className="w-6 h-6" />} label="Requests Sent" value={stats.requestsSent ?? 0} color="emerald" />
        <StatCard icon={<TrendingUp className="w-6 h-6" />} label="Requests Received" value={stats.requestsReceived ?? 0} color="orange" />
        <StatCard icon={<Clock className="w-6 h-6" />} label="Pending Requests" value={stats.pendingRequests ?? 0} color="purple" />
        <StatCard icon={<Star className="w-6 h-6" />} label="Average Rating" value={stats.averageRating ?? '0.0'} color="blue" />
        <StatCard icon={<Award className="w-6 h-6" />} label="Total Exchanges" value={stats.totalExchanges ?? 0} color="emerald" />
      </div>

      {/* Quick Actions Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/skills?new=1">
            <button className="w-full p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition text-left">
              <p className="font-semibold text-gray-900">Add New Skill</p>
              <p className="text-sm text-gray-600 mt-1">
                Share a new skill you can teach
              </p>
            </button>
          </Link>
          <Link href="/skills">
            <button className="w-full p-4 border-2 border-emerald-200 rounded-lg hover:bg-emerald-50 transition text-left">
              <p className="font-semibold text-gray-900">Browse Skills</p>
              <p className="text-sm text-gray-600 mt-1">
                Find skills you want to learn
              </p>
            </button>
          </Link>
          <Link href="/dashboard/requests">
            <button className="w-full p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition text-left">
              <p className="font-semibold text-gray-900">View Requests</p>
              <p className="text-sm text-gray-600 mt-1">
                Check incoming skill exchange requests
              </p>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
