import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Edit2, X, ExternalLink } from 'lucide-react';
import { App } from '../../types/app';
import { updateApp, deleteApp } from '../../utils/apps/app-service';

interface Props {
  app: App;
  onClose: () => void;
  onUpdate: () => void;
}

export function AppDetails({ app, onClose, onUpdate }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: app.name,
    description: app.description || '',
    type: app.type,
    config_schema: app.config_schema
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateApp(app.id, formData);
      toast.success('App updated successfully');
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to update app:', error);
      toast.error('Failed to update app');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this app?')) {
      return;
    }

    setLoading(true);
    try {
      await deleteApp(app.id);
      toast.success('App deleted successfully');
      onClose();
      onUpdate();
    } catch (error) {
      console.error('Failed to delete app:', error);
      toast.error('Failed to delete app');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApp = () => {
    if (app.type === 'netlify' && app.config_schema.url?.default) {
      window.open(app.config_schema.url.default as string, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">App Details</h2>
            <p className="text-sm text-gray-500">View and manage app settings</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              >
                <option value="netlify">Netlify</option>
                <option value="grader">Grader</option>
                <option value="quiz">Quiz</option>
                <option value="simulation">Simulation</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="config_schema" className="block text-sm font-medium text-gray-700">
                Configuration Schema (JSON)
              </label>
              <textarea
                id="config_schema"
                value={JSON.stringify(formData.config_schema, null, 2)}
                onChange={(e) => {
                  try {
                    const schema = JSON.parse(e.target.value);
                    setFormData(prev => ({ ...prev, config_schema: schema }));
                  } catch (error) {
                    // Allow invalid JSON while typing
                  }
                }}
                rows={6}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
              />
              <p className="mt-1 text-sm text-gray-500">
                Define the configuration options for this app in JSON format
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
              >
                Delete App
              </button>
              
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{app.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{app.description}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700">Type</h4>
              <p className="mt-1 text-sm text-gray-900 capitalize">{app.type}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700">Slug</h4>
              <p className="mt-1 text-sm text-gray-900 font-mono">{app.slug}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700">Configuration Schema</h4>
              <pre className="mt-1 p-4 bg-gray-50 rounded-md overflow-auto text-sm font-mono">
                {JSON.stringify(app.config_schema, null, 2)}
              </pre>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
              >
                Delete App
              </button>
              
              <div className="space-x-2">
                {app.type === 'netlify' && app.config_schema.url?.default && (
                  <button
                    onClick={handleOpenApp}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open App
                  </button>
                )}
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit App
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}