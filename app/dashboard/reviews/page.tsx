'use client';

import { useEffect, useMemo, useState } from 'react';
import { Filter, Search, Star, User, MessageSquare, TrendingUp, Award, Loader, AlertCircle } from 'lucide-react';
import { reviewApi, Review } from '@/services/reviewApi';
import { useAuth } from '@/hooks/useAuth';
import { formatErrorForDisplay } from '@/services/errorUtils';

type ReviewType = 'received' | 'given';

const reviewerName = (r: Review) =>
  r.reviewer?.displayName || r.reviewer?.username || 'Unknown';

const reviewerInitial = (r: Review) =>
  (reviewerName(r)[0] || '?').toUpperCase();

const formatDate = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const getRatingColor = (rating: number) => {
  if (rating === 5) return 'bg-green-50 border-green-200';
  if (rating === 4) return 'bg-blue-50 border-blue-200';
  if (rating === 3) return 'bg-yellow-50 border-yellow-200';
  if (rating === 2) return 'bg-orange-50 border-orange-200';
  return 'bg-red-50 border-red-200';
};

const getRatingStarColor = (rating: number) => {
  if (rating === 5) return 'text-green-500';
  if (rating === 4) return 'text-blue-500';
  if (rating === 3) return 'text-yellow-500';
  if (rating === 2) return 'text-orange-500';
  return 'text-red-500';
};

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | ReviewType>('all');
  const [filterRating, setFilterRating] = useState<'all' | number>('all');

  useEffect(() => {
    if (user?.id) loadReviews(String(user.id));
  }, [user?.id]);

  const loadReviews = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      // Fetch reviews where I'm the reviewer (given) OR the reviewee (received)
      const [receivedRes, givenRes] = await Promise.all([
        reviewApi.getAll({ 'filters[reviewee][id][$eq]': userId } as any),
        reviewApi.getAll({ 'filters[reviewer][id][$eq]': userId } as any),
      ]);
      const received: Review[] = (receivedRes as any)?.data ?? [];
      const given: Review[]    = (givenRes    as any)?.data ?? [];
      // Merge and deduplicate by id
      const seen = new Set<string>();
      const merged: Review[] = [];
      for (const r of [...received, ...given]) {
        const key = String(r.id);
        if (!seen.has(key)) { seen.add(key); merged.push(r); }
      }
      setReviews(merged);
    } catch (err) {
      const displayError = formatErrorForDisplay(err);
      if (displayError) setError(displayError);
    } finally {
      setLoading(false);
    }
  };

  // A review is "given" when the current user wrote it (reviewer)
  // A review is "received" when the current user's skill was reviewed (reviewee)
  const reviewType = (r: Review): ReviewType =>
    user && String(r.reviewer?.id) === String(user.id) ? 'given' : 'received';

  const filteredReviews = reviews.filter((review) => {
    const q = searchQuery.toLowerCase();
    const skillTitle = review.skill?.title || '';
    const matchesSearch =
      skillTitle.toLowerCase().includes(q) ||
      reviewerName(review).toLowerCase().includes(q) ||
      (review.comment || '').toLowerCase().includes(q);
    const matchesType = filterType === 'all' || reviewType(review) === filterType;
    const matchesRating = filterRating === 'all' || review.rating === filterRating;
    return matchesSearch && matchesType && matchesRating;
  });

  const receivedReviews = useMemo(
    () => reviews.filter((r) => reviewType(r) === 'received'),
    [reviews, user]
  );
  const givenReviews = useMemo(
    () => reviews.filter((r) => reviewType(r) === 'given'),
    [reviews, user]
  );

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : '0';

  const receivedAverageRating =
    receivedReviews.length > 0
      ? (receivedReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / receivedReviews.length).toFixed(1)
      : '0';

  return (
    <div>
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600 mt-2">View feedback from your learners and reviews you've given</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Total Reviews</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">{reviews.length}</p>
            </div>
            <Award className="w-12 h-12 text-blue-400 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Received Reviews</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">{receivedReviews.length}</p>
              <p className="text-sm text-green-700 mt-1">Avg: {receivedAverageRating}⭐</p>
            </div>
            <User className="w-12 h-12 text-green-400 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Given Reviews</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">{givenReviews.length}</p>
            </div>
            <MessageSquare className="w-12 h-12 text-purple-400 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Overall Rating</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">{averageRating}</p>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i <= Math.round(parseFloat(averageRating)) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <TrendingUp className="w-12 h-12 text-yellow-400 opacity-50" />
          </div>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by skill, reviewer name, or comment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3 flex-wrap items-center">
          <Filter className="w-4 h-4 text-gray-600" />

          {(['all', 'received', 'given'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${
                filterType === type ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}

          <div className="ml-auto flex gap-2 items-center flex-wrap">
            <span className="text-sm text-gray-600 font-semibold">Rating:</span>
            <button
              onClick={() => setFilterRating('all')}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                filterRating === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => setFilterRating(rating)}
                className={`px-2 py-1 rounded text-xs font-semibold transition flex items-center gap-1 ${
                  filterRating === rating ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {rating}
                <Star className="w-3 h-3 fill-current" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold text-lg">No reviews found</p>
          <p className="text-gray-500 mt-2">Try adjusting your filters or search criteria</p>
        </div>
      ) : (
        <div className="space-y-4 pb-12">
          {filteredReviews.map((review) => {
            const type = reviewType(review);
            return (
              <div
                key={review.id}
                className={`border-2 rounded-lg p-6 transition hover:shadow-lg ${getRatingColor(review.rating)}`}
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {reviewerInitial(review)}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-900">{reviewerName(review)}</h3>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i <= review.rating
                                    ? `fill-current ${getRatingStarColor(review.rating)}`
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2 items-center mb-3 flex-wrap">
                          <span className="text-sm font-semibold text-gray-700">
                            {review.skill?.title || 'Untitled skill'}
                          </span>
                          {review.skill?.category?.name && (
                            <span className="px-2 py-1 bg-white/50 rounded text-xs font-semibold text-gray-600">
                              {review.skill.category.name}
                            </span>
                          )}
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              type === 'received'
                                ? 'bg-green-200 text-green-800'
                                : 'bg-purple-200 text-purple-800'
                            }`}
                          >
                            {type === 'received' ? 'Received' : 'Given'}
                          </span>
                        </div>

                        <p className="text-gray-700 text-sm leading-relaxed mb-2">{review.comment}</p>
                        <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                      </div>

                      <div className="flex-shrink-0 text-right">
                        <p className={`text-2xl font-bold ${getRatingStarColor(review.rating)}`}>
                          {review.rating}.0
                        </p>
                        <p className="text-xs text-gray-500 mt-1">out of 5</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
