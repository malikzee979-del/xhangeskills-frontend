'use client';

import { useEffect, useState } from 'react';
import { Star, Loader, AlertCircle, MessageSquare, Filter } from 'lucide-react';
import { reviewApi } from '@/services/reviewApi';
import { formatErrorForDisplay } from '@/services/errorUtils';

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  reviewer?: { id?: string; username?: string; displayName?: string };
  skill?: { id?: string; title?: string };
  type?: 'received' | 'given';
}

const ratingTile = (r: number) => `rating-tile-${Math.max(1, Math.min(5, Math.round(r)))}`;
const ratingStar = (r: number) => `rating-star-${Math.max(1, Math.min(5, Math.round(r)))}`;

function Stars({ value, className = '' }: { value: number; className?: string }) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= Math.round(value) ? 'star-on' : 'star-off'}`}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'received' | 'given'>('all');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = (await reviewApi.getMyReviews()) as { data?: Review[] };
      setReviews(res?.data ?? []);
    } catch (err: any) {
      const displayError = formatErrorForDisplay(err);
      if (displayError) setError(displayError);
    } finally {
      setLoading(false);
    }
  };

  const filtered = reviews.filter((r) => filter === 'all' || r.type === filter);
  const received = reviews.filter((r) => r.type === 'received');
  const avg = received.length
    ? (received.reduce((s, r) => s + (r.rating || 0), 0) / received.length).toFixed(1)
    : '—';

  return (
    <div className="reveal">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-content font-display">Reviews</h1>
        <p className="text-muted mt-2">Feedback from your skill exchanges</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-danger-soft border border-danger/30 rounded-md flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
          <p className="text-danger text-sm">{error}</p>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <p className="text-muted text-sm">Average rating</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-4xl font-bold text-content font-display">{avg}</span>
            <Stars value={received.length ? Number(avg) : 0} />
          </div>
        </div>
        <div className="card p-6">
          <p className="text-muted text-sm">Reviews received</p>
          <p className="text-4xl font-bold text-content font-display mt-2">{received.length}</p>
        </div>
        <div className="card p-6">
          <p className="text-muted text-sm">Reviews given</p>
          <p className="text-4xl font-bold text-content font-display mt-2">{reviews.length - received.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 items-center mb-6 flex-wrap">
        <Filter className="w-4 h-4 text-muted" />
        {(['all', 'received', 'given'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`filter-pill ${filter === f ? 'filter-pill-active-accent' : ''}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Star className="w-16 h-16 text-subtle/40 mx-auto mb-4" />
          <p className="text-content font-semibold text-lg">No reviews yet</p>
          <p className="text-muted mt-2">Complete a skill exchange to start collecting reviews</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((review) => (
            <div key={review.id} className={`card card-hover p-5 border ${ratingTile(review.rating)}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 avatar-accent rounded-full flex items-center justify-center font-bold">
                    {(review.reviewer?.displayName || review.reviewer?.username || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-content text-sm">
                      {review.reviewer?.displayName || review.reviewer?.username || 'Anonymous'}
                    </p>
                    <p className="text-xs text-subtle">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`badge px-2.5 py-1 text-xs ${review.type === 'received' ? 'badge-received' : 'badge-given'}`}>
                  {review.type === 'received' ? 'Received' : 'Given'}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <Stars value={review.rating} />
                <span className={`text-sm font-bold ${ratingStar(review.rating)}`}>
                  {review.rating.toFixed(1)}
                </span>
              </div>

              {review.skill?.title && (
                <p className="text-xs text-muted mb-2">
                  For: <span className="font-semibold">{review.skill.title}</span>
                </p>
              )}

              {review.comment && (
                <div className="flex gap-2 mt-3 p-3 bg-surface-2 rounded-md">
                  <MessageSquare className="w-4 h-4 text-subtle flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted italic">{review.comment}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
