'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { skillApi, Skill } from '@/services/skillApi';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import SendRequestModal from '@/components/SendRequestModal';
import { Clock, AlertCircle, CheckCircle, User, ArrowLeft, Loader, Tag, Pencil, Trash2 } from 'lucide-react';

const statusMap: Record<string, { icon: typeof CheckCircle; bg: string; text: string; label: string }> = {
  pending:  { icon: Clock,         bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending Review' },
  approved: { icon: CheckCircle,   bg: 'bg-green-100',  text: 'text-green-800',  label: 'Approved'      },
  rejected: { icon: AlertCircle,   bg: 'bg-red-100',    text: 'text-red-800',    label: 'Rejected'      },
};

function StatusBadge({ status }: { status: string }) {
  const s = statusMap[status] ?? statusMap.pending;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
      <Icon className="w-3 h-3" />
      {s.label}
    </span>
  );
}

export default function SkillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => { loadSkill(); }, [id]);

  const loadSkill = async () => {
    try {
      setLoading(true);
      const res = await skillApi.getOne(id);
      setSkill((res as any)?.data || null);
    } catch (err: any) {
      if (err?.status !== 404) setError('Could not load skill');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this skill permanently?')) return;
    try {
      await skillApi.delete(id);
      router.push('/dashboard/skills');
    } catch {
      setError('Failed to delete skill');
    }
  };

  const isOwner = skill && user && String(skill.user?.id) === String(user.id);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm text-gray-500">Loading skill...</p>
      </div>
    );
  }

  if (error || !skill) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <p className="font-semibold text-gray-800">{error || 'Skill not found'}</p>
        <Link href="/marketplace" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back link */}
      <Link href="/marketplace" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Cover image */}
        {skill.coverImageUrl ? (
          <div className="w-full h-64 sm:h-80 overflow-hidden">
            <img
              src={skill.coverImageUrl}
              alt={skill.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-40 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <span className="text-7xl font-bold text-blue-200 select-none">
              {skill.title[0]?.toUpperCase()}
            </span>
          </div>
        )}

        <div className="p-6 sm:p-8">
          {/* Title + status */}
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{skill.title}</h1>
            {isOwner && <StatusBadge status={skill.status} />}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            {skill.category && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                <Tag className="w-3 h-3" />
                {skill.category.name}
              </span>
            )}
            {skill.baseSkill && (
              <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-100">
                {skill.baseSkill.name}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 text-base leading-relaxed mb-6">{skill.description}</p>

          {/* Rejection notice */}
          {isOwner && skill.status === 'rejected' && skill.rejectionReason && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm font-semibold text-red-700 mb-1">Rejection Reason</p>
              <p className="text-sm text-red-600">{skill.rejectionReason}</p>
            </div>
          )}

          {/* Success banner */}
          {requestSent && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-sm font-semibold text-green-700">Request sent successfully!</p>
              <p className="text-xs text-green-600 mt-0.5">The skill provider will review and respond to your request.</p>
            </div>
          )}

          {/* Provider card */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {(skill.user?.displayName || skill.user?.username || 'U')[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                {skill.user?.displayName || skill.user?.username || 'Unknown'}
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <User className="w-3 h-3" /> Skill Provider
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {isOwner ? (
              <>
                <Link
                  href={`/skills/${id}/edit`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition"
                >
                  <Pencil className="w-4 h-4" /> Edit Skill
                </Link>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-100 border border-red-200 transition"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </>
            ) : isAuthenticated ? (
              <button
                onClick={() => setShowModal(true)}
                disabled={requestSent}
                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {requestSent ? 'Request Sent ✓' : 'Request This Skill'}
              </button>
            ) : (
              <Link
                href={`/login?next=/skills/${id}`}
                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition"
              >
                Sign in to Request
              </Link>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <SendRequestModal
          skill={{ id: String(skill.id), title: skill.title }}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setRequestSent(true); setTimeout(() => setRequestSent(false), 8000); }}
        />
      )}
    </div>
  );
}
