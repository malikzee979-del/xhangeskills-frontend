'use client';

import { useState } from 'react';
import { Lock, Bell, Eye, Globe, Users, Shield, Save, ToggleRight, ToggleLeft, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { authApi } from '@/services/authApi';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'account' | 'privacy' | 'notifications'>('account');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    // Account Settings
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',

    // Privacy Settings
    profileVisibility: 'public', // public, private, friends-only
    allowMessages: true,
    allowRequests: true,
    showEmail: false,
    showPhone: false,

    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    requestNotifications: true,
    messageNotifications: true,
    reviewNotifications: true,
    promotionalEmails: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setSettings(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setSaveError(null);
    setSaveSuccess(null);
    if (activeTab === 'account') {
      if (!settings.currentPassword && !settings.newPassword && !settings.confirmPassword) {
        setSaveSuccess('No changes to save.');
        setTimeout(() => setSaveSuccess(null), 3000);
        return;
      }
      if (!settings.currentPassword) { setSaveError('Current password is required.'); return; }
      if (!settings.newPassword) { setSaveError('New password is required.'); return; }
      if (settings.newPassword.length < 6) { setSaveError('New password must be at least 6 characters.'); return; }
      if (!/[A-Z]/.test(settings.newPassword)) { setSaveError('New password must contain at least one uppercase letter.'); return; }
      if (!/[0-9]/.test(settings.newPassword)) { setSaveError('New password must contain at least one number.'); return; }
      if (settings.newPassword === settings.currentPassword) { setSaveError('New password must be different from current password.'); return; }
      if (settings.newPassword !== settings.confirmPassword) { setSaveError('New password and confirmation do not match.'); return; }
      try {
        setSaving(true);
        await authApi.changePassword(settings.currentPassword, settings.newPassword, settings.confirmPassword);
        setSettings((prev) => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        setSaveSuccess('Password changed successfully.');
        setTimeout(() => setSaveSuccess(null), 4000);
      } catch (err: any) {
        setSaveError(err?.message || 'Failed to change password.');
      } finally {
        setSaving(false);
      }
    } else {
      setSaveSuccess('Settings saved.');
      setTimeout(() => setSaveSuccess(null), 3000);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account, privacy, and notification preferences</p>
      </div>

      {/* Settings Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Navigation */}
        <div className="md:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setActiveTab('account')}
              className={`w-full px-6 py-4 text-left font-semibold transition flex items-center gap-3 ${
                activeTab === 'account'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Lock className="w-5 h-5" />
              Account
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="md:col-span-2">
          {saveError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{saveError}</p>
            </div>
          )}
          {saveSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-700 text-sm">{saveSuccess}</p>
            </div>
          )}
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            {/* Account Settings */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>

                {/* Change Password */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Change Password
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={settings.currentPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={settings.newPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={settings.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>


                {/* Save Button */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy Settings</h2>

                {/* Profile Visibility */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Profile Visibility
                  </h3>
                  <select
                    name="profileVisibility"
                    value={settings.profileVisibility}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="public">Public - Everyone can see your profile</option>
                    <option value="friends-only">Friends Only - Only connected users</option>
                    <option value="private">Private - Hidden from search</option>
                  </select>
                  <p className="text-sm text-gray-600 mt-2">
                    Control who can view your profile and skills
                  </p>
                </div>

                {/* Communication Settings */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Communication
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <label className="font-semibold text-gray-700">Allow Direct Messages</label>
                      <button
                        onClick={() => handleToggle('allowMessages')}
                        className="transition"
                      >
                        {settings.allowMessages ? (
                          <ToggleRight className="w-6 h-6 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <label className="font-semibold text-gray-700">Allow Skill Requests</label>
                      <button
                        onClick={() => handleToggle('allowRequests')}
                        className="transition"
                      >
                        {settings.allowRequests ? (
                          <ToggleRight className="w-6 h-6 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Visibility Settings */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Show Contact Info
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <label className="font-semibold text-gray-700">Show Email</label>
                      <button
                        onClick={() => handleToggle('showEmail')}
                        className="transition"
                      >
                        {settings.showEmail ? (
                          <ToggleRight className="w-6 h-6 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <label className="font-semibold text-gray-700">Show Phone</label>
                      <button
                        onClick={() => handleToggle('showPhone')}
                        className="transition"
                      >
                        {settings.showPhone ? (
                          <ToggleRight className="w-6 h-6 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h2>

                {/* Notification Channels */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notification Channels
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <label className="font-semibold text-gray-700">Email Notifications</label>
                      <button
                        onClick={() => handleToggle('emailNotifications')}
                        className="transition"
                      >
                        {settings.emailNotifications ? (
                          <ToggleRight className="w-6 h-6 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <label className="font-semibold text-gray-700">Push Notifications</label>
                      <button
                        onClick={() => handleToggle('pushNotifications')}
                        className="transition"
                      >
                        {settings.pushNotifications ? (
                          <ToggleRight className="w-6 h-6 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notification Types */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notify Me About</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="font-semibold text-gray-700">Skill Requests</label>
                        <p className="text-sm text-gray-600">New requests for your skills</p>
                      </div>
                      <button
                        onClick={() => handleToggle('requestNotifications')}
                        className="transition"
                      >
                        {settings.requestNotifications ? (
                          <ToggleRight className="w-6 h-6 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="font-semibold text-gray-700">Messages</label>
                        <p className="text-sm text-gray-600">New messages from users</p>
                      </div>
                      <button
                        onClick={() => handleToggle('messageNotifications')}
                        className="transition"
                      >
                        {settings.messageNotifications ? (
                          <ToggleRight className="w-6 h-6 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="font-semibold text-gray-700">Reviews & Ratings</label>
                        <p className="text-sm text-gray-600">New reviews from learners</p>
                      </div>
                      <button
                        onClick={() => handleToggle('reviewNotifications')}
                        className="transition"
                      >
                        {settings.reviewNotifications ? (
                          <ToggleRight className="w-6 h-6 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="font-semibold text-gray-700">Promotional Emails</label>
                        <p className="text-sm text-gray-600">News, updates, and special offers</p>
                      </div>
                      <button
                        onClick={() => handleToggle('promotionalEmails')}
                        className="transition"
                      >
                        {settings.promotionalEmails ? (
                          <ToggleRight className="w-6 h-6 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
