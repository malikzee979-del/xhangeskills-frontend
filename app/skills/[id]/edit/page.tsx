'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { skillApi, CreateSkillData, Skill } from '@/services/skillApi';
import { categoryApi, Category } from '@/services/categoryApi';
import { baseSkillApi, BaseSkill } from '@/services/baseSkillApi';
import { uploadService } from '@/services/uploadService';
import { formatErrorForDisplay } from '@/services/errorUtils';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/Button';
import { Upload, X, Loader } from 'lucide-react';

export default function EditSkillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [baseSkills, setBaseSkills] = useState<BaseSkill[]>([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showNewBaseSkill, setShowNewBaseSkill] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newBaseSkillName, setNewBaseSkillName] = useState('');
  const [formData, setFormData] = useState<CreateSkillData>({
    title: '',
    description: '',
    category: '',
    baseSkill: '',
    coverImageUrl: '',
    proposedCategoryName: '',
    proposedBaseSkillName: '',
  });

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadData();
  }, [id, isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [catRes, baseRes, skillRes] = await Promise.all([
        categoryApi.getAll(),
        baseSkillApi.getAll({ populate: '*' }),
        skillApi.getOne(id),
      ]);
      setCategories(catRes.data || []);
      setBaseSkills(baseRes.data || []);

      const skill: Skill = skillRes.data;
      setFormData({
        title: skill.title,
        description: skill.description,
        category: skill.category?.id || '',
        baseSkill: skill.baseSkill?.id || '',
        coverImageUrl: skill.coverImageUrl || '',
        proposedCategoryName: skill.proposedCategoryName || '',
        proposedBaseSkillName: skill.proposedBaseSkillName || '',
      });

      if (skill.coverImageUrl) {
        setImagePreview(skill.coverImageUrl);
      }

      // if there is a proposed field, show the new input for user to change
      if (skill.proposedCategoryName) {
        setShowNewCategory(true);
      }
      if (skill.proposedBaseSkillName) {
        setShowNewBaseSkill(true);
      }
    } catch (err: any) {
      const displayError = formatErrorForDisplay(err, 'Failed to load skill');
      if (displayError) {
        setError(displayError);
      }
    } finally {
      setLoading(false);
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
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);

      const imageUrl = await uploadService.uploadFile(file);
      if (!imageUrl) {
        setError('Failed to upload image');
        return;
      }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setSaving(true);
      const submitData: any = {
        title: formData.title,
        description: formData.description,
        coverImageUrl: formData.coverImageUrl,
      };

      if (formData.proposedCategoryName) {
        submitData.proposedCategoryName = formData.proposedCategoryName;
        submitData.category = '';
      } else if (formData.category) {
        submitData.category = formData.category;
      }

      if (formData.proposedBaseSkillName) {
        submitData.proposedBaseSkillName = formData.proposedBaseSkillName;
        submitData.baseSkill = '';
      } else if (formData.baseSkill) {
        submitData.baseSkill = formData.baseSkill;
      }

      await skillApi.update(id, submitData);
      router.push(`/skills/${id}`);
    } catch (err: any) {
      const displayError = formatErrorForDisplay(err, 'Failed to update skill');
      if (displayError) {
        setError(displayError);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-12">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-6">Edit Skill</h2>
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Category selection / proposal */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-sm font-semibold mb-2">Category</h3>
              {!formData.proposedCategoryName ? (
                <div className="space-y-2">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select existing category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewCategory(true)}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    + Propose New Category
                  </button>
                </div>
              ) : (
                <div className="bg-blue-50 p-3 rounded-lg flex justify-between items-center">
                  <span className="font-medium">New Category: <strong>{formData.proposedCategoryName}</strong></span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, proposedCategoryName: '' })}
                    className="text-red-600 hover:text-red-700"
                  >
                    Change
                  </button>
                </div>
              )}
              {showNewCategory && (
                <div className="mt-2 space-y-2">
                  <input
                    type="text"
                    placeholder="Enter new category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddNewCategory}>
                      Propose Category
                    </Button>
                    <Button
                      size="sm"
                      variant="outlined"
                      onClick={() => {
                        setShowNewCategory(false);
                        setNewCategoryName('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
            {/* Base skill selection / proposal */}
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-sm font-semibold mb-2">Skill Type</h3>
              {!formData.proposedBaseSkillName ? (
                <div className="space-y-2">
                  <select
                    value={formData.baseSkill}
                    onChange={(e) => setFormData({ ...formData, baseSkill: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select existing skill type</option>
                    {baseSkills.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewBaseSkill(true)}
                    className="text-green-600 hover:text-green-700 font-medium text-sm"
                  >
                    + Propose New Skill Type
                  </button>
                </div>
              ) : (
                <div className="bg-green-50 p-3 rounded-lg flex justify-between items-center">
                  <span className="font-medium">New Skill Type: <strong>{formData.proposedBaseSkillName}</strong></span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, proposedBaseSkillName: '' })}
                    className="text-red-600 hover:text-red-700"
                  >
                    Change
                  </button>
                </div>
              )}
              {showNewBaseSkill && (
                <div className="mt-2 space-y-2">
                  <input
                    type="text"
                    placeholder="Enter new skill type name"
                    value={newBaseSkillName}
                    onChange={(e) => setNewBaseSkillName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddNewBaseSkill}>
                      Propose Skill Type
                    </Button>
                    <Button
                      size="sm"
                      variant="outlined"
                      onClick={() => {
                        setShowNewBaseSkill(false);
                        setNewBaseSkillName('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="text-sm font-semibold mb-2">Cover Image</h3>
              {formData.coverImageUrl && imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Cover preview"
                    className="w-full h-48 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="block relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  {uploading ? (
                    <div className="flex items-center justify-center gap-2 text-blue-600">
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Uploading...</span>
                    </div>
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
            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Update Skill'}
              </Button>
              <Button variant="outlined" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
