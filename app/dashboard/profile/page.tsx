'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, Edit2, Save, X, Mail, Phone, MapPin, Award, Star, Users, Zap, Loader, AlertCircle } from 'lucide-react';
import { profileApi } from '@/services/profileApi';
import { skillApi } from '@/services/skillApi';
import { reviewApi } from '@/services/reviewApi';
import { uploadService } from '@/services/uploadService';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalSkills: 0, averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = typeof window !== 'undefined'
        ? localStorage.getItem('userId') || sessionStorage.getItem('userId')
        : null;

      const [profileRes, skillsRes] = await Promise.all([
        profileApi.getCurrentProfile(),
        skillApi.getMe(),
      ]);

      const p = (profileRes as any)?.data || profileRes;
      setProfile(p);
      setEditData({
        displayName: p?.displayName || p?.user?.displayName || '',
        bio: p?.bio || '',
        location: p?.location || '',
        phone: p?.phone || '',
        profilePicUrl: p?.profilePicUrl || '',
      });

      const mySkills = (skillsRes as any)?.data || [];
      setSkills(mySkills);

      if (userId) {
        const reviewRes = (await reviewApi.getAll({ 'filters[reviewee][id][$eq]': userId } as any)) as any;
        const reviews: any[] = reviewRes?.data || [];
        const avg = reviews.length
          ? reviews.reduce((s: number, r: any) => s + (r.rating || 0), 0) / reviews.length
          : 0;
        setStats({ totalSkills: mySkills.length, averageRating: parseFloat(avg.toFixed(1)), totalReviews: reviews.length });
      }
    } catch (err: any) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = uploadService.validateImageFile(file);
    if (!validation.valid) { setError(validation.error || 'Invalid image'); return; }
    try {
      setUploading(true);
      setError(null);
      const url = await uploadService.uploadFile(file);
      const avatarStorage = localStorage.getItem('rememberMe') === 'true' ? localStorage : sessionStorage;
      avatarStorage.setItem('userAvatar', url);
      setEditData((prev: any) => ({ ...prev, profilePicUrl: url }));
      // Notify header component about avatar update
      window.dispatchEvent(new CustomEvent('avatarUpdated', { detail: { avatar: url } }));
    } catch (err: any) {
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const validateProfile = (): string | null => {
    if (!editData.displayName?.trim()) return 'Display name is required.';
    if (editData.displayName.trim().length < 2) return 'Display name must be at least 2 characters.';
    if (editData.displayName.trim().length > 60) return 'Display name must be 60 characters or less.';
    if (editData.phone && editData.phone.trim() && !/^\+?[\d\s\-().]{7,20}$/.test(editData.phone.trim()))
      return 'Enter a valid phone number.';
    if (editData.bio && editData.bio.trim().length > 500) return 'Bio must be 500 characters or less.';
    return null;
  };

  const handleSave = async () => {
    const ve = validateProfile();
    if (ve) { setError(ve); return; }
    try {
      setSaving(true);
      setError(null);
      const res = (await profileApi.updateCurrent(editData)) as any;
      const updated = res?.data || res;
      setProfile(updated);
      // Update localStorage and notify header if avatar changed
      if (editData.profilePicUrl) {
        const avatarStorage = localStorage.getItem('rememberMe') === 'true' ? localStorage : sessionStorage;
        avatarStorage.setItem('userAvatar', editData.profilePicUrl);
        window.dispatchEvent(new CustomEvent('avatarUpdated', { detail: { avatar: editData.profilePicUrl } }));
      }
      setIsEditing(false);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      displayName: profile?.displayName || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      phone: profile?.phone || '',
      profilePicUrl: profile?.profilePicUrl || '',
    });
    setIsEditing(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const displayName = isEditing ? editData.displayName : (profile?.displayName || profile?.user?.username || 'User');
  const avatarUrl = isEditing ? editData.profilePicUrl : (profile?.profilePicUrl || '');
  const joinDate = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : '';

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}

      {/* Profile Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg h-32 relative mb-4" />

        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-end px-6 md:px-0">
          {/* Avatar */}
          <div className="relative -mt-20">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg" />
            ) : (
              <div className="w-40 h-40 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-5xl font-bold">
                {displayName[0]?.toUpperCase() || '?'}
              </div>
            )}
            {isEditing && (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {uploading ? <Loader className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </>
            )}
          </div>

          {/* Name & meta */}
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                name="displayName"
                value={editData.displayName}
                onChange={handleEditChange}
                placeholder="Display name"
                className="text-3xl font-bold text-gray-900 border-b-2 border-blue-600 pb-2 w-full focus:outline-none mb-2"
              />
            ) : (
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{displayName}</h1>
            )}
            <div className="flex flex-wrap gap-4 text-gray-600 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{profile?.user?.email || ''}</span>
              </div>
              {(isEditing ? editData.location : profile?.location) && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{isEditing ? editData.location : profile?.location}</span>
                </div>
              )}
              {stats.averageRating > 0 && (
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{stats.averageRating} rating</span>
                </div>
              )}
            </div>
          </div>

          {/* Edit/Save buttons */}
          <div>
            {isEditing ? (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex items-center gap-4">
          <Zap className="w-10 h-10 text-blue-600" />
          <div>
            <p className="text-gray-600 text-sm font-semibold">Total Skills</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalSkills}</p>
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 flex items-center gap-4">
          <Users className="w-10 h-10 text-emerald-600" />
          <div>
            <p className="text-gray-600 text-sm font-semibold">Total Reviews</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex items-center gap-4">
          <Star className="w-10 h-10 text-yellow-600" />
          <div>
            <p className="text-gray-600 text-sm font-semibold">Average Rating</p>
            <p className="text-2xl font-bold text-gray-900">{stats.averageRating || '—'}</p>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 flex items-center gap-4">
          <Award className="w-10 h-10 text-purple-600" />
          <div>
            <p className="text-gray-600 text-sm font-semibold">Member Since</p>
            <p className="text-sm font-bold text-gray-900">{joinDate || '—'}</p>
          </div>
        </div>
      </div>

      {/* Edit Form / Info Display */}
      <div className="bg-white border border-gray-200 rounded-lg p-8 space-y-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900">About</h2>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
              <textarea
                name="bio"
                value={editData.bio}
                onChange={handleEditChange}
                rows={4}
                placeholder="Tell the community about yourself..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={editData.phone}
                  onChange={handleEditChange}
                  placeholder="+1 (123) 456-7890"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={editData.location}
                  onChange={handleEditChange}
                  placeholder="City, Country"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Bio</h3>
              <p className="text-gray-700">{profile?.bio || 'No bio yet.'}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile?.phone && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Phone
                  </h3>
                  <p className="text-gray-700">{profile.phone}</p>
                </div>
              )}
              {profile?.location && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Location
                  </h3>
                  <p className="text-gray-700">{profile.location}</p>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                <p className="text-gray-700">{profile?.user?.email || ''}</p>
              </div>
              {joinDate && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Member Since</h3>
                  <p className="text-gray-700">{joinDate}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Skills Preview */}
      {skills.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {skills.slice(0, 6).map((skill) => (
              <div key={skill.id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <p className="text-gray-700 text-sm font-semibold">{skill.title}</p>
                {skill.category?.name && (
                  <p className="text-xs text-blue-600 mt-1">{skill.category.name}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
