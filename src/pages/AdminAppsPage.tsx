import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { App, CreateAppData } from '../types/app';
import { fetchApps, createApp } from '../utils/apps/app-service';
import { AppDetails } from '../components/apps/AppDetails';
import { NetlifyAppForm } from '../components/apps/NetlifyAppForm';

export function AdminAppsPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [showNetlifyForm, setShowNetlifyForm] = useState(false);
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
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
      toast.error('Failed to load apps');
    } finally {
      setLoading(false);
    }
  };

  if (loading && apps.length === 0) {
    return <div className="text-center py-8">Loading apps...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Apps</h1>
          <button
            onClick={() => setShowNetlifyForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add App
          </button>
        </div>

        {showNetlifyForm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
              <h2 className="text-lg font-medium mb-4">Add App</h2>
              <NetlifyAppForm
                onSuccess={() => {
                  setShowNetlifyForm(false);
                  loadApps();
                }}
                onCancel={() => setShowNetlifyForm(false)}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map(app => (
            <button
              key={app.id}
              onClick={() => setSelectedApp(app)}
              className="text-left bg-white p-4 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{app.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{app.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="capitalize">{app.type}</span>
                <span className="text-gray-400">{app.slug}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedApp && (
        <AppDetails
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onUpdate={() => {
            loadApps();
            setSelectedApp(null);
          }}
        />
      )}
    </div>
  );
}