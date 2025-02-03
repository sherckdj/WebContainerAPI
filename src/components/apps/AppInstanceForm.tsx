import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { App, CreateAppInstanceData } from '../../types/app';
import { createAppInstance } from '../../utils/apps/app-service';

interface Props {
  app: App;
  courseId: string;
  contentId?: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AppInstanceForm({ app, courseId, contentId, onSuccess, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateAppInstanceData>({
    app_id: app.id,
    course_id: courseId,
    content_id: contentId || undefined,
    title: '',
    config: {
      description: '',
      url: app.config_schema.url?.default || ''
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Ensure we have a URL for Netlify apps
      if (app.type === 'netlify' && !formData.config.url) {
        throw new Error('URL is required for Netlify apps');
      }

      await createAppInstance(formData);
      toast.success('App added successfully');
      onSuccess();
    } catch (error) {
      console.error('Failed to add app:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add app');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Enter a title for this app"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={formData.config.description as string || ''}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            config: { ...prev.config, description: e.target.value }
          }))}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Provide instructions or context for this app"
          required
        />
      </div>

      {app.type === 'netlify' && (
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700">
            URL
          </label>
          <input
            type="url"
            id="url"
            value={formData.config.url as string || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              config: { ...prev.config, url: e.target.value }
            }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter the Netlify app URL"
            required
          />
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add App'}
        </button>
      </div>
    </form>
  );
}