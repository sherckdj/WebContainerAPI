import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { AppInstance, CreateAppSubmissionData } from '../../types/app';
import { createAppSubmission } from '../../utils/apps/app-service';

interface Props {
  instance: AppInstance;
  onSuccess: () => void;
}

export function AppSubmissionForm({ instance, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateAppSubmissionData>({
    instance_id: instance.id,
    submission_data: {}
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createAppSubmission(formData);
      toast.success('Submission successful');
      onSuccess();
    } catch (error) {
      console.error('Failed to submit:', error);
      toast.error('Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Render submission fields based on app type and config */}
      <div>
        <label htmlFor="submission" className="block text-sm font-medium text-gray-700">
          Your Submission
        </label>
        <textarea
          id="submission"
          value={formData.submission_data.content as string || ''}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            submission_data: { ...prev.submission_data, content: e.target.value }
          }))}
          rows={6}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
}