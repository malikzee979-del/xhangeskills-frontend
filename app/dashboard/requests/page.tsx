'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Filter, Search, Clock, MapPin, CheckCircle, XCircle, AlertCircle, Loader, Star, MessageSquare } from 'lucide-react';
import { serviceRequestApi, ServiceRequest } from '@/services/serviceRequestApi';
import { formatErrorForDisplay } from '@/services/errorUtils';
import SendRequestModal from '@/components/SendRequestModal';
import SubmitReviewModal from '@/components/SubmitReviewModal';
import { skillApi } from '@/services/skillApi';
import Link from 'next/link';

type Status = 'pending' | 'accepted' | 'rejected' | 'completed';
type ServiceMode = 'REMOTE' | 'ONSITE' | 'HYBRID';

interface UIRequest extends ServiceRequest {
  provider?: any;
  serviceMode?: ServiceMode;
  serviceLocation?: string;
  duration?: number;
  requestedTime?: string;
  respondedAt?: string;
  responseNote?: string;
}

const statusConfig: Record<Status, { bgColor: string; borderColor: string; textColor: string; icon: typeof CheckCircle; label: string }> = {
  pending:   { bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', textColor: 'text-yellow-700', icon: AlertCircle,   label: 'Pending'   },
  accepted:  { bgColor: 'bg-green-50',  borderColor: 'border-green-200',  textColor: 'text-green-700',  icon: CheckCircle,   label: 'Accepted'  },
  rejected:  { bgColor: 'bg-red-50',    borderColor: 'border-red-200',    textColor: 'text-red-700',    icon: XCircle,       label: 'Rejected'  },
  completed: { bgColor: 'bg-blue-50',   borderColor: 'border-blue-200',   textColor: 'text-blue-700',   icon: CheckCircle,   label: 'Completed' },
};

const requesterName = (r: UIRequest) => r.requester?.displayName || r.requester?.username || 'Unknown';
const requesterInitial = (r: UIRequest) => (requesterName(r)[0] || '?').toUpperCase();

export default function RequestsPage() {
  const [requests, setRequests]         = useState<UIRequest[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [searchQuery, setSearchQuery]   = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Status>('all');
  const [filterMode, setFilterMode]     = useState<'all' | ServiceMode>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modals
  const [showNewRequest, setShowNewRequest]   = useState(false);
  const [newRequestSkill, setNewRequestSkill] = useState<{ id: string; title: string } | null>(null);
  const [skillSearch, setSkillSearch]         = useState('');
  const [skillResults, setSkillResults]       = useState<any[]>([]);
  const [skillSearching, setSkillSearching]   = useState(false);
  const [reviewRequest, setReviewRequest]     = useState<UIRequest | null>(null);

  // Reject reason popup
  const [rejectTarget, setRejectTarget] = useState<UIRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const router = useRouter();
  const currentUserId = typeof window !== 'undefined'
    ? localStorage.getItem('userId') || sessionStorage.getItem('userId') || ''
    : '';

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = (await serviceRequestApi.getAll()) as { data?: UIRequest[] };
      setRequests(response?.data ?? []);
    } catch (err: any) {
      const displayError = formatErrorForDisplay(err);
      if (displayError) setError(displayError);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      setActionLoading(id + '-accept');
      await serviceRequestApi.accept(id);
      await loadRequests();
    } catch (err) {
      // Error accepting request - silently continue
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = (request: UIRequest) => {
    setRejectReason('');
    setRejectTarget(request);
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    try {
      setActionLoading(rejectTarget.id + '-reject');
      await serviceRequestApi.reject(rejectTarget.id, rejectReason.trim() || undefined);
      setRejectTarget(null);
      setRejectReason('');
      await loadRequests();
    } catch (err) {
      // Error rejecting request - silently continue
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      setActionLoading(id + '-complete');
      await serviceRequestApi.complete(id);
      await loadRequests();
    } catch (err) {
      // Error completing request - silently continue
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenChat = (request: UIRequest) => {
    router.push(`/dashboard/chat?requestId=${request.id}`);
  };

  // Skill search for new request modal
  const handleSkillSearch = async (q: string) => {
    setSkillSearch(q);
    if (q.trim().length < 2) { setSkillResults([]); return; }
    try {
      setSkillSearching(true);
      const res = (await skillApi.getAll({ 'filters[status][$eq]': 'approved', _q: q, populate: '*' } as any)) as any;
      setSkillResults(res?.data?.slice(0, 8) || []);
    } catch { setSkillResults([]); }
    finally { setSkillSearching(false); }
  };

  const filteredRequests = requests.filter((request) => {
    const skillTitle = request.skill?.title || '';
    const name = requesterName(request);
    const details = request.requestDetails || '';
    const q = searchQuery.toLowerCase();
    const matchesSearch = skillTitle.toLowerCase().includes(q) || name.toLowerCase().includes(q) || details.toLowerCase().includes(q);
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesMode   = filterMode === 'all' || request.serviceMode === filterMode;
    return matchesSearch && matchesStatus && matchesMode;
  });

  const pendingCount   = requests.filter((r) => r.status === 'pending').length;
  const acceptedCount  = requests.filter((r) => r.status === 'accepted').length;
  const rejectedCount  = requests.filter((r) => r.status === 'rejected').length;
  const completedCount = requests.filter((r) => r.status === 'completed').length;

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Skill Requests</h1>
            <p className="text-gray-600 mt-2">Manage incoming and outgoing skill exchange requests</p>
          </div>
          <button
            onClick={() => { setShowNewRequest(true); setSkillSearch(''); setSkillResults([]); setNewRequestSkill(null); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            New Request
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Search & filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by skill, requester, or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-4 flex-wrap">
            <div className="flex gap-2 items-center flex-wrap">
              <Filter className="w-4 h-4 text-gray-600" />
              {(['all', 'pending', 'accepted', 'rejected', 'completed'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${
                    filterStatus === s
                      ? s === 'all' ? 'bg-blue-600 text-white' : s === 'pending' ? 'bg-yellow-600 text-white' : s === 'accepted' ? 'bg-green-600 text-white' : s === 'rejected' ? 'bg-red-600 text-white' : 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                  {s === 'pending' ? ` (${pendingCount})` : s === 'accepted' ? ` (${acceptedCount})` : s === 'rejected' ? ` (${rejectedCount})` : s === 'completed' ? ` (${completedCount})` : ''}
                </button>
              ))}
            </div>
            <div className="flex gap-2 items-center ml-auto flex-wrap">
              <span className="text-sm text-gray-600 font-semibold">Mode:</span>
              {(['all', 'REMOTE', 'ONSITE', 'HYBRID'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition ${
                    filterMode === mode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {mode === 'all' ? 'All' : mode.charAt(0) + mode.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-16">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold text-lg">No requests found</p>
          <p className="text-gray-500 mt-2">Try adjusting your filters or send a new request</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
          {filteredRequests.map((request) => {
            const config = statusConfig[request.status as Status] ?? statusConfig.pending;
            const StatusIcon = config.icon;
            const isProvider  = String(request.provider?.id) === currentUserId;
            const isRequester = String(request.requester?.id) === currentUserId;

            return (
              <div
                key={request.id}
                className={`border-2 rounded-lg overflow-hidden transition shadow-md hover:shadow-xl ${config.bgColor} ${config.borderColor}`}
              >
                <div className="flex flex-col h-full">
                  <div className="relative h-40 overflow-hidden bg-gray-100">
                    {request.skill?.coverImageUrl ? (
                      <img src={request.skill.coverImageUrl} alt={request.skill?.title || 'Skill'} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl font-bold">
                        {(request.skill?.title || '?')[0].toUpperCase()}
                      </div>
                    )}
                    <div className={`absolute top-3 right-3 ${config.textColor} bg-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1`}>
                      <StatusIcon className="w-3 h-3" />
                      {config.label}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-gray-900 text-sm mb-2">{request.skill?.title || 'Untitled skill'}</h3>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {requesterInitial(request)}
                      </div>
                      <p className="text-xs text-gray-700 font-semibold">{requesterName(request)}</p>
                      {isRequester && <span className="text-xs text-blue-600 font-medium">(you)</span>}
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 mb-3">{request.requestDetails || '—'}</p>

                    <div className="space-y-1 mb-3 text-xs text-gray-600">
                      {request.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{request.duration} mins{request.requestedTime ? ` · ${new Date(request.requestedTime).toLocaleDateString()}` : ''}</span>
                        </div>
                      )}
                      {request.serviceMode && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span className="capitalize">{request.serviceMode.toLowerCase()}{request.serviceLocation ? ` · ${request.serviceLocation}` : ''}</span>
                        </div>
                      )}
                    </div>

                    {request.responseNote && (
                      <div className="mb-3 p-2 bg-white/60 rounded border border-current border-opacity-20">
                        <p className="text-xs text-gray-600 italic">Note: {request.responseNote}</p>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 mt-auto flex-wrap">
                      {request.status === 'pending' && isProvider && (
                        <>
                          <button
                            onClick={() => handleAccept(request.id)}
                            disabled={actionLoading === request.id + '-accept'}
                            className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded font-semibold text-xs hover:bg-green-700 transition disabled:opacity-50"
                          >
                            {actionLoading === request.id + '-accept' ? '...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleReject(request)}
                            disabled={actionLoading === request.id + '-reject'}
                            className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded font-semibold text-xs hover:bg-red-700 transition disabled:opacity-50"
                          >
                            {actionLoading === request.id + '-reject' ? '...' : 'Reject'}
                          </button>
                        </>
                      )}
                      {request.status === 'accepted' && (
                        <>
                          <button
                            onClick={() => handleOpenChat(request)}
                            className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded font-semibold text-xs hover:bg-blue-700 transition flex items-center justify-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" /> Chat
                          </button>
                          {isProvider && (
                            <button
                              onClick={() => handleComplete(request.id)}
                              disabled={actionLoading === request.id + '-complete'}
                              className="flex-1 px-3 py-1.5 bg-purple-600 text-white rounded font-semibold text-xs hover:bg-purple-700 transition disabled:opacity-50"
                            >
                              {actionLoading === request.id + '-complete' ? '...' : 'Mark Done'}
                            </button>
                          )}
                        </>
                      )}
                      {request.status === 'completed' && isRequester && (
                        <button
                          onClick={() => setReviewRequest(request)}
                          className="flex-1 px-3 py-1.5 bg-yellow-500 text-white rounded font-semibold text-xs hover:bg-yellow-600 transition flex items-center justify-center gap-1"
                        >
                          <Star className="w-3 h-3" /> Leave Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      <div className="mt-8 pt-8 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Total', value: requests.length, color: 'blue' },
          { label: 'Pending', value: pendingCount, color: 'yellow' },
          { label: 'Accepted', value: acceptedCount, color: 'green' },
          { label: 'Rejected', value: rejectedCount, color: 'red' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`bg-${color}-50 border border-${color}-200 rounded-lg p-4`}>
            <p className="text-gray-600 text-sm">{label}</p>
            <p className={`text-3xl font-bold text-${color}-700 mt-1`}>{value}</p>
          </div>
        ))}
      </div>

      {/* New Request — Skill search picker */}
      {showNewRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowNewRequest(false)} />
          {newRequestSkill ? (
            <SendRequestModal
              skill={newRequestSkill}
              onClose={() => { setShowNewRequest(false); setNewRequestSkill(null); }}
              onSuccess={() => { setShowNewRequest(false); setNewRequestSkill(null); loadRequests(); }}
            />
          ) : (
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Find a Skill to Request</h2>
              <p className="text-sm text-gray-600 mb-3">Search for a skill from the marketplace to send a request.</p>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={skillSearch}
                  onChange={(e) => handleSkillSearch(e.target.value)}
                  placeholder="Search skills..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                {skillSearching && <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-blue-500" />}
              </div>
              {skillResults.length > 0 ? (
                <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded-lg">
                  {skillResults.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setNewRequestSkill({ id: String(s.id), title: s.title })}
                      className="w-full text-left p-3 hover:bg-blue-50 transition"
                    >
                      <p className="font-semibold text-gray-900 text-sm">{s.title}</p>
                      <p className="text-xs text-gray-500">{s.category?.name || ''} · by {s.user?.username || 'Unknown'}</p>
                    </button>
                  ))}
                </div>
              ) : skillSearch.length >= 2 && !skillSearching ? (
                <p className="text-sm text-gray-500 py-4 text-center">No skills found. Try different keywords.</p>
              ) : null}
              <div className="flex justify-between mt-4">
                <Link href="/marketplace">
                  <button className="text-sm text-blue-600 hover:underline">Browse marketplace →</button>
                </Link>
                <button
                  onClick={() => setShowNewRequest(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review modal */}
      {reviewRequest && (
        <SubmitReviewModal
          request={{ id: reviewRequest.id, skill: reviewRequest.skill }}
          onClose={() => setReviewRequest(null)}
          onSuccess={() => { setReviewRequest(null); loadRequests(); }}
        />
      )}

      {/* Reject reason popup */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setRejectTarget(null)} />
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Reject Request</h2>
            <p className="text-sm text-gray-500 mb-4">
              Rejecting request for <span className="font-semibold text-gray-700">{rejectTarget.skill?.title || 'this skill'}</span> from{' '}
              <span className="font-semibold text-gray-700">{requesterName(rejectTarget)}</span>.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Reason <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="e.g. Schedule conflict, skill mismatch, not available at requested time..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                autoFocus
              />
              <p className="text-xs text-gray-400 mt-1">The requester will see this reason.</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={confirmReject}
                disabled={actionLoading === rejectTarget.id + '-reject'}
                className="flex-1 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {actionLoading === rejectTarget.id + '-reject' ? (
                  <><Loader className="w-4 h-4 animate-spin" /> Rejecting...</>
                ) : (
                  <><XCircle className="w-4 h-4" /> Confirm Reject</>
                )}
              </button>
              <button
                onClick={() => setRejectTarget(null)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
