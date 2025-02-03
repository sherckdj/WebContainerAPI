import React, { useState } from 'react';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { Grade, CreateGradeData } from '../../types/grade';
import { User } from '../../types/user';
import { Link } from 'react-router-dom';

interface Props {
  courseId: string;
  grades: Grade[];
  students: User[];
  onCreateGrade: (studentId: string, data: CreateGradeData) => Promise<void>;
  onUpdateGrade: (gradeId: string, data: Partial<CreateGradeData>) => Promise<void>;
  onDeleteGrade: (gradeId: string) => Promise<void>;
}

export function GradeList({
  courseId,
  grades,
  students,
  onCreateGrade,
  onUpdateGrade,
  onDeleteGrade
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [formData, setFormData] = useState<CreateGradeData & { student_id?: string }>({
    activity_title: '',
    score: 0,
    feedback: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGrade) {
        await onUpdateGrade(editingGrade.id, formData);
      } else if (formData.student_id) {
        await onCreateGrade(formData.student_id, formData);
      }
      setShowForm(false);
      setEditingGrade(null);
      setFormData({ activity_title: '', score: 0, feedback: '' });
    } catch (error) {
      console.error('Failed to save grade:', error);
    }
  };

  const handleDelete = async (gradeId: string) => {
    if (window.confirm('Are you sure you want to delete this grade?')) {
      try {
        await onDeleteGrade(gradeId);
      } catch (error) {
        console.error('Failed to delete grade:', error);
      }
    }
  };

  // Group grades by student
  const gradesByStudent = grades.reduce((acc, grade) => {
    const studentId = grade.student_id;
    if (!acc[studentId]) {
      acc[studentId] = [];
    }
    acc[studentId].push(grade);
    return acc;
  }, {} as Record<string, Grade[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Grades</h2>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Grade
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-medium mb-4">
              {editingGrade ? 'Edit Grade' : 'Add New Grade'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingGrade && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Student
                  </label>
                  <select
                    value={formData.student_id || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, student_id: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select a student</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Activity Title
                </label>
                <input
                  type="text"
                  value={formData.activity_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, activity_title: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Score (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.score}
                  onChange={(e) => setFormData(prev => ({ ...prev, score: parseFloat(e.target.value) }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Feedback
                </label>
                <textarea
                  value={formData.feedback}
                  onChange={(e) => setFormData(prev => ({ ...prev, feedback: e.target.value }))}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingGrade(null);
                    setFormData({ activity_title: '', score: 0, feedback: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  {editingGrade ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {students.map(student => (
          <div key={student.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <Link
                to={`/users/${student.id}`}
                className="text-lg font-medium text-indigo-600 hover:text-indigo-800"
              >
                {student.email}
              </Link>
            </div>

            {gradesByStudent[student.id]?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Activity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Feedback
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {gradesByStudent[student.id].map(grade => (
                      <tr key={grade.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {grade.activity_title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {grade.score}%
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {grade.feedback}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingGrade(grade);
                                setFormData({
                                  activity_title: grade.activity_title,
                                  score: grade.score,
                                  feedback: grade.feedback || ''
                                });
                                setShowForm(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(grade.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No grades recorded</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}