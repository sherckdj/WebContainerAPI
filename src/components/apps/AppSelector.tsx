import React, { useEffect, useState } from 'react';
import { AppWindow } from 'lucide-react';
import { App } from '../../types/app';
import { fetchApps } from '../../utils/apps/app-service';

interface Props {
  onSelect: (app: App) => void;
}

export function AppSelector({ onSelect }: Props) {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    try {
      const appsData = await fetchApps();
      setApps(appsData);
    } catch (error) {
      console.error('Failed to load apps:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading apps...</div>;
  }

  if (apps.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <AppWindow className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No apps available</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please contact an administrator to add apps to the library.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {apps.map(app => (
        <button
          key={app.id}
          onClick={() => onSelect(app)}
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 text-left"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{app.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{app.description}</p>
            </div>
            <AppWindow className="h-5 w-5 text-gray-400" />
          </div>
          <div className="text-sm text-gray-500">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
              {app.type}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}