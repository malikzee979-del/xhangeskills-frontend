"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { skillApi } from '@/services/skillApi';
import { categoryApi } from '@/services/categoryApi';
import { baseSkillApi } from '@/services/baseSkillApi';
import { uploadService } from '@/services/uploadService';
import { formatErrorForDisplay } from '@/services/errorUtils';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/Button';
import { Upload, X, Loader } from 'lucide-react';

type Props = {
  onClose?: () => void;
};

export default function CreateSkillDialog({ onClose }: Props) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [baseSkills, setBaseSkills] = useState<any[]>([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showNewBaseSkill, setShowNewBaseSkill] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newBaseSkillName, setNewBaseSkillName] = useState('');
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    category: '',
    baseSkill: '',
    coverImageUrl: '',
    proposedCategoryName: '',
    proposedBaseSkillName: '',
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      const [catRes, skillRes] = await Promise.all([
        categoryApi.getAll(),
        baseSkillApi.getAll({ populate: '*' }),
      ]);
      setCategories(catRes.data || []);
      setBaseSkills(skillRes.data || []);
    } catch (err) {
      // Error loading data - silently continue
    }
  };

  const handleAddNewCategory = () => {
    if (newCategoryName.trim()) {
      setFormData({
        ...formData,
        category: '',
        proposedCategoryName: newCategoryName,
      });
      setShowNewCategory(false);
      setNewCategoryName('');
    }
  };

  const handleAddNewBaseSkill = () => {
    if (newBaseSkillName.trim()) {
      setFormData({
        ...formData,
        baseSkill: '',
        proposedBaseSkillName: newBaseSkillName,
      });
      setShowNewBaseSkill(false);
      setNewBaseSkillName('');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = uploadService.validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid image file');
      return;
    }
    try {
      setUploading(true);
      setError(null);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
      const imageUrl = await uploadService.uploadFile(file);
      setFormData({ ...formData, coverImageUrl: imageUrl });
    } catch (err: any) {
      const displayError = formatErrorForDisplay(err, 'Failed to upload image');
      setError(displayError);
      setImagePreview('');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, coverImageUrl: '' });
    setImagePreview('');
  };

  const validate = (): string | null => {
    if (!formData.title.trim()) return 'Skill title is required.';
    if (formData.title.trim().length < 3) return 'Title must be at least 3 characters.';
    if (formData.title.trim().length > 100) return 'Title must be 100 characters or less.';
    if (formData.description && formData.description.trim().length > 0 && formData.description.trim().length < 10)
      return 'Description must be at least 10 characters if provided.';
    if (!formData.category && !formData.proposedCategoryName)
      return 'Please select a category or propose a new one.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    try {
      setLoading(true);
      const submitData: any = {
        title: formData.title,
        description: formData.description,
        coverImageUrl: formData.coverImageUrl,
      };
      if (formData.proposedCategoryName) {
        submitData.proposedCategoryName = formData.proposedCategoryName;
      } else if (formData.category) {
        submitData.category = formData.category;
      }
      if (formData.proposedBaseSkillName) {
        submitData.proposedBaseSkillName = formData.proposedBaseSkillName;
      } else if (formData.baseSkill) {
        submitData.baseSkill = formData.baseSkill;
      }
      await skillApi.create(submitData);
      if (onClose) {
        onClose();
      }
    } catch (err: any) {
      const displayError = formatErrorForDisplay(err, 'Failed to create skill');
      setError(displayError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0" onClick={() => (onClose ? onClose() : router.back())} />
      <div className="relative w-full max-w-2xl mx-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Add New Skill</h2>
            <button
              aria-label="Close"
              className="text-gray-500 hover:text-gray-700"
              onClick={() => (onClose ? onClose() : router.back())}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {error && <p className="text-red-600 mb-4 p-3 bg-red-50 rounded">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., Professional Photography Services"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Describe your skill, experience, and what you can offer"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              {!formData.proposedCategoryName ? (
                <div className="space-y-2">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select existing category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setShowNewCategory(true)}>+ Create New</Button>
                    {showNewCategory && (
                      <div className="flex gap-2">
                        <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="px-2 py-1 border rounded" />
                        <Button size="sm" onClick={handleAddNewCategory}>Create</Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 p-3 rounded-lg flex justify-between items-center">
                  <span>New Category: <strong>{formData.proposedCategoryName}</strong></span>
                  <button onClick={() => setFormData({ ...formData, proposedCategoryName: '' })} className="text-red-600">Change</button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
              {formData.coverImageUrl && imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Cover preview" className="w-full h-48 object-cover rounded-lg border" />
                  <button type="button" onClick={handleRemoveImage} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <label className="block relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500">
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                  {uploading ? (
                    <div className="flex items-center justify-center gap-2 text-blue-600"><Loader className="w-5 h-5 animate-spin" /><span>Uploading...</span></div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 text-gray-600">
                      <Upload className="w-8 h-8" />
                      <span className="font-medium">Click to upload or drag and drop</span>
                      <span className="text-sm text-gray-500">PNG, JPG, WebP, GIF up to 5MB</span>
                    </div>
                  )}
                </label>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <Button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit for Review'}</Button>
              {/* red cancel button per standard design */}
              <Button variant="danger" onClick={() => (onClose ? onClose() : router.back())}>Cancel</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
