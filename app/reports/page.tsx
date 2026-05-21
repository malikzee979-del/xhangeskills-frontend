'use client';

import { useEffect, useState } from 'react';
import { reportApi, Report } from '@/services/reportApi';
import Button from '@/components/Button';
import { AlertCircle, Clock, CheckCircle, Loader } from 'lucide-react';

const statusConfig = {
  pending: { icon: Clock, color: 'yellow', label: 'Pending' },
  resolved: { icon: CheckCircle, color: 'green', label: 'Resolved' },
  dismissed: { icon: AlertCircle, color: 'red', label: 'Dismissed' },
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [formData, setFormData] = useState({
    reportedUserId: '',
    reason: '',
    description: '',
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reportApi.getAll();
      setReports(response.data || []);
    } catch (err) {
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await reportApi.create({
        reportedUserId: formData.reportedUserId,
        reason: formData.reason,
        description: formData.description,
      });
      setFormData({ reportedUserId: '', reason: '', description: '' });
      setShowReportForm(false);
      loadReports();
    } catch (error) {
      // Error submitting report - silently continue
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-2">
            Report inappropriate users or content
          </p>
        </div>
        <Button onClick={() => setShowReportForm(!showReportForm)}>
          {showReportForm ? 'Cancel' : 'Report User'}
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Report Form */}
      {showReportForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Submit a Report
          </h2>
          <form onSubmit={handleSubmitReport} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User ID to Report
              </label>
              <input
                type="text"
                value={formData.reportedUserId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    reportedUserId: e.target.value,
                  }))
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter user ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason
              </label>
              <select
                value={formData.reason}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, reason: e.target.value }))
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a reason</option>
                <option value="harassment">Harassment</option>
                <option value="spam">Spam</option>
                <option value="inappropriate">Inappropriate Content</option>
                <option value="fraud">Fraud</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please provide details about your report..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Submit Report
              </button>
              <button
                type="button"
                onClick={() => setShowReportForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reports List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 text-lg">No reports submitted yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const config = statusConfig[report.status];
            const Icon = config.icon;

            return (
              <div
                key={report.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Report on {report.reportedUser?.username || 'Unknown'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Reported by {report.reporter?.username || 'Unknown'} on{' '}
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 text-${config.color}-600`} />
                    <span className={`text-sm font-medium text-${config.color}-600`}>
                      {config.label}
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{report.reason}</p>

                {/* Metadata */}
                <div className="text-xs text-gray-500">
                  Report ID: {report.id}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
