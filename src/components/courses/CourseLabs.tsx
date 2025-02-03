import React, { useState } from 'react';
import { Plus, ExternalLink, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { CourseLab } from '../../types/course';
import { App } from '../../types/app';
import { createCourseLab, deleteCourseLab } from '../../utils/courses/course-service';
import { fetchApps } from '../../utils/apps/app-service';

interface Props {
  courseId: string;
  labs: CourseLab[];
  canEdit: boolean;
  onLabsChange: () => void;
}

export function CourseLabs({ courseId, labs, canEdit, onLabsChange }: Props) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apps, setApps] = useState<App[]>([]);
  const [formData, setFormData] = useState({
    app_id: '',
    title: '',
    description: ''
  });

  const loadApps = async () => {
    try {
      const appsData = await fetchApps();
      setApps(appsData);
    } catch (error) {
      console.error('Failed to load apps:', error);
      toast.error('Failed to load apps');
    }
  };

  const handleShowForm = async () => {
    await loadApps();
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createCourseLab(courseId, formData);
      toast.success('Lab added successfully');
      setShowAddForm(false);
      setFormData({ app_id: '', title: '', description: '' });
      onLabsChange();
    } catch (error) {
      console.error('Failed to add lab:', error);
      toast.error('Failed to add lab');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (labId: string) => {
    if (!window.confirm('Are you sure you want to delete this lab?')) return;

    try {
      await deleteCourseLab(labId);
      toast.success('Lab deleted successfully');
      onLabsChange();
    } catch (error) {
      console.error('Failed to delete lab:', error);
      toast.error('Failed to delete lab');
    }
  };

  const handleStartLab = (lab: CourseLab) => {
    if (!lab.app?.config_schema.url?.default) {
      toast.error('Lab URL not configured');
      return;
    }

    window.open(lab.app.config_schema.url.default as string, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Course Labs</h3>
        {canEdit && (
          <button
            onClick={handleShowForm}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Lab
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-medium mb-4">Add New Lab</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  App
                </label>
                <select
                  value={formData.app_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, app_id: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select an app</option>
                  {apps.map(app => (
                    <option key={app.id} value={app.id}>
                      {app.name} ({app.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  {loading ? 'Adding...' : 'Add Lab'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {labs.map(lab => (
          <div key={lab.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-lg font-medium text-gray-900">{lab.title}</h4>
                {lab.description && (
                  <p className="mt-1 text-sm text-gray-500">{lab.description}</p>
                )}
                <p className="mt-2 text-xs text-gray-400">
                  App: {lab.app?.name} ({lab.app?.type})
                </p>
              </div>
              <div className="flex space-x-2">
                {lab.app?.type === 'netlify' && lab.app?.config_schema.url?.default && (
                  <button
                    onClick={() => handleStartLab(lab)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open Lab
                  </button>
                )}
                {canEdit && (
                  <button
                    onClick={() => handleDelete(lab.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete lab"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}