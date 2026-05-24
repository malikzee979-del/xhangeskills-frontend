'use client';

import { useState } from 'react';
import { X, Loader, Star, Send } from 'lucide-react';
import { reviewApi } from '@/services/reviewApi';
import { formatErrorForDisplay } from '@/services/errorUtils';

interface Props {
  request: { id: string; skill?: { id?: string; title?: string } };
  onClose: () => void;
  onSuccess: () => void;
}

export default function SubmitReviewModal({ request, onClose, onSuccess }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (rating < 1) {
      setError('Please select a rating.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await reviewApi.create({
        serviceRequestId: request.id,
        rating,
        comment: comment.trim() || undefined,
      } as any);
      onSuccess();
    } catch (err: any) {
      setError(formatErrorForDisplay(err) || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="modal-scrim" onClick={onClose} />
      <div className="modal-card relative w-full max-w-md p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-subtle hover:text-content transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-content mb-1 font-display">Leave a review</h2>
        {request.skill?.title && (
          <p className="text-sm text-muted mb-5">
            For <span className="font-semibold text-accent">{request.skill.title}</span>
          </p>
        )}

        {error && (
          <div className="mb-4 p-3 bg-danger-soft border border-danger/30 rounded-md">
            <p className="text-danger text-sm">{error}</p>
          </div>
        )}

        <div className="flex justify-center gap-2 mb-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(i)}
              className="transition-transform hover:scale-110"
              aria-label={`${i} star${i > 1 ? 's' : ''}`}
            >
              <Star className={`w-9 h-9 ${i <= (hover || rating) ? 'star-on' : 'star-off'}`} />
            </button>
          ))}
        </div>

        <div className="mb-5">
          <label className="block text-sm font-semibold text-muted mb-1">Comment (optional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Share how the exchange went..."
            className="field px-3 py-2 text-sm resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary flex-1 py-2.5 text-sm">
            {submitting ? <><Loader className="w-4 h-4 animate-spin" /> Submitting...</> : <><Send className="w-4 h-4" /> Submit review</>}
          </button>
          <button onClick={onClose} className="btn btn-ghost px-5 py-2.5 text-sm">Cancel</button>
        </div>
      </div>
    </div>
  );
}
