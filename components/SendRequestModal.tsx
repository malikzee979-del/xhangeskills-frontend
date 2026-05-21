'use client';

import { useState } from 'react';
import { X, Loader, AlertCircle } from 'lucide-react';
import { serviceRequestApi } from '@/services/serviceRequestApi';

interface Props {
  skill: { id: string; title: string };
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SendRequestModal({ skill, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    requestDetails: '',
    serviceMode: 'REMOTE',
    serviceLocation: '',
    duration: '',
    requestedTime: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (): string | null => {
    if (!form.requestDetails.trim()) return 'Please describe what you need.';
    if (form.requestDetails.trim().length < 10) return 'Details must be at least 10 characters.';
    if (!form.duration) return 'Duration is required.';
    const dur = Number(form.duration);
    if (isNaN(dur) || dur < 15) return 'Duration must be at least 15 minutes.';
    if (dur > 480) return 'Duration cannot exceed 8 hours (480 minutes).';
    if (form.serviceMode !== 'REMOTE' && !form.serviceLocation.trim()) return 'Location is required for on-site or hybrid sessions.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    try {
      setLoading(true);
      setError(null);
      await serviceRequestApi.create({
        skill: skill.id,
        requestDetails: form.requestDetails,
        serviceMode: form.serviceMode as any,
        serviceLocation: form.serviceLocation || undefined,
        duration: Number(form.duration),
        requestedTime: form.requestedTime || undefined,
      } as any);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">Request Skill</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Sending request for: <span className="font-semibold text-blue-600">{skill.title}</span>
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">What do you need? *</label>
            <textarea
              name="requestDetails"
              value={form.requestDetails}
              onChange={handleChange}
              rows={3}
              placeholder="Describe your requirements, goals, and any relevant details..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Service Mode *</label>
              <select
                name="serviceMode"
                value={form.serviceMode}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="REMOTE">Remote</option>
                <option value="ONSITE">On-site</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Duration (minutes) *</label>
              <input
                type="number"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="e.g. 60"
                min={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {form.serviceMode !== 'REMOTE' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
              <input
                type="text"
                name="serviceLocation"
                value={form.serviceLocation}
                onChange={handleChange}
                placeholder="City or address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Preferred Date / Time</label>
            <input
              type="datetime-local"
              name="requestedTime"
              value={form.requestedTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Request'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
