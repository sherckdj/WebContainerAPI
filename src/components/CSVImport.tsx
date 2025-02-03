import React, { useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Upload } from 'lucide-react';
import { parseCSV } from '../utils/csv';
import { createUser } from '../utils/user-management';

interface Props {
  onSuccess: () => void;
}

export function CSVImport({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const csvContent = e.target?.result as string;
        const users = parseCSV(csvContent);
        
        let successCount = 0;
        let errorCount = 0;

        for (const userData of users) {
          try {
            await createUser(userData);
            successCount++;
          } catch (error) {
            errorCount++;
            console.error(`Failed to create user ${userData.email}:`, error);
          }
        }

        if (successCount > 0) {
          toast.success(`Successfully created ${successCount} users`);
          onSuccess();
        }
        
        if (errorCount > 0) {
          toast.error(`Failed to create ${errorCount} users`);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to process CSV');
      } finally {
        setLoading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Import Users from CSV</h3>
        <a
          href="/template.csv"
          download
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          Download Template
        </a>
      </div>
      <label
        className={`
          flex justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer
          hover:border-indigo-500 focus:outline-none
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <span className="flex items-center space-x-2">
          <Upload className="w-6 h-6 text-gray-600" />
          <span className="font-medium text-gray-600">
            {loading ? 'Importing...' : 'Drop CSV file or click to upload'}
          </span>
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileUpload}
          disabled={loading}
        />
      </label>
      <p className="mt-2 text-sm text-gray-500">
        CSV must include email, password, and role columns
      </p>
    </div>
  );
}