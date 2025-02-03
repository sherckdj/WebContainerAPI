import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { createApp } from '../../utils/apps/app-service';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export function NetlifyAppForm({ onSuccess, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const [netlifyUrl, setNetlifyUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate Netlify URL
      const url = new URL(netlifyUrl);
      if (!url.hostname.endsWith('.netlify.app')) {
        throw new Error('Invalid Netlify URL. Must end with .netlify.app');
      }

      // Extract app name from URL
      const appName = url.hostname.split('.')[0];
      
      await createApp({
        name: appName,
        slug: appName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        type: 'netlify',
        description: `Netlify app hosted at ${netlifyUrl}`,
        config_schema: {
          url: {
            type: 'string',
            title: 'Netlify URL',
            description: 'The URL of the Netlify app',
            default: netlifyUrl
          }
        }
      });

      toast.success('Netlify app added successfully');
      onSuccess();
    } catch (error) {
      console.error('Failed to add Netlify app:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add Netlify app');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="netlifyUrl" className="block text-sm font-medium text-gray-700">
          Netlify URL
        </label>
        <input
          type="url"
          id="netlifyUrl"
          value={netlifyUrl}
          onChange={(e) => setNetlifyUrl(e.target.value)}
          placeholder="https://your-app.netlify.app"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
          pattern="https://.*\.netlify\.app"
        />
        <p className="mt-1 text-sm text-gray-500">
          Enter the full URL of your Netlify app (must end with .netlify.app)
        </p>
      </div>

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
          {loading ? 'Adding...' : 'Add Netlify App'}
        </button>
      </div>
    </form>
  );
}