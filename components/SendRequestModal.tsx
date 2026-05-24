'use client';

import { useState } from 'react';
import { X, Loader, Send, Clock, MapPin } from 'lucide-react';
import { serviceRequestApi } from '@/services/serviceRequestApi';
import { formatErrorForDisplay } from '@/services/errorUtils';

interface Props {
  skill: { id: string; title: string };
  onClose: () => void;
  onSuccess: () => void;
}

export default function SendRequestModal({ skill, onClose, onSuccess }: Props) {
  const [requestDetails, setRequestDetails] = useState('');
  const [serviceMode, setServiceMode] = useState<'REMOTE' | 'ONSITE' | 'HYBRID'>('REMOTE');
  const [serviceLocation, setServiceLocation] = useState('');
  const [duration, setDuration] = useState(60);
  const [requestedTime, setRequestedTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!requestDetails.trim()) {
      setError('Please describe what you need.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await serviceRequestApi.create({
        skillId: skill.id,
        requestDetails: requestDetails.trim(),
        serviceMode,
        serviceLocation: serviceLocation.trim() || undefined,
        duration,
        requestedTime: requestedTime || undefined,
      } as any);
      onSuccess();
    } catch (err: any) {
      setError(formatErrorForDisplay(err) || 'Failed to send request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-card relative w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-subtle hover:text-content transition"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      <h2 className="text-xl font-bold text-content mb-1 font-display">Send a request</h2>
      <p className="text-sm text-muted mb-5">
        Requesting <span className="font-semibold text-accent">{skill.title}</span>
      </p>

      {error && (
        <div className="mb-4 p-3 bg-danger-soft border border-danger/30 rounded-md">
          <p className="text-danger text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-muted mb-1">What do you need?</label>
          <textarea
            value={requestDetails}
            onChange={(e) => setRequestDetails(e.target.value)}
            rows={4}
            placeholder="Describe what you'd like to learn or exchange..."
            className="field px-3 py-2 text-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-muted mb-2">Service mode</label>
          <div className="flex gap-2">
            {(['REMOTE', 'ONSITE', 'HYBRID'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setServiceMode(mode)}
                className={`filter-pill flex-1 ${serviceMode === mode ? 'filter-pill-active-accent' : ''}`}
              >
                {mode.charAt(0) + mode.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {serviceMode !== 'REMOTE' && (
          <div>
            <label className="block text-sm font-semibold text-muted mb-1">
              <MapPin className="w-3.5 h-3.5 inline mr-1" /> Location
            </label>
            <input
              type="text"
              value={serviceLocation}
              onChange={(e) => setServiceLocation(e.target.value)}
              placeholder="e.g. Lahore, or a meeting point"
              className="field px-3 py-2 text-sm"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-muted mb-1">
              <Clock className="w-3.5 h-3.5 inline mr-1" /> Duration (mins)
            </label>
            <input
              type="number"
              value={duration}
              min={15}
              step={15}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="field px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-muted mb-1">Preferred time</label>
            <input
              type="datetime-local"
              value={requestedTime}
              onChange={(e) => setRequestedTime(e.target.value)}
              className="field px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary flex-1 py-2.5 text-sm">
          {submitting ? <><Loader className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send request</>}
        </button>
        <button onClick={onClose} className="btn btn-ghost px-5 py-2.5 text-sm">Cancel</button>
      </div>
    </div>
  );
}
