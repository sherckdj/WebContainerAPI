import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { CourseLab } from '../../types/course';
import { fetchCourseLabs } from '../../utils/courses/course-service';
import { CourseLabs } from './CourseLabs';

interface Props {
  courseId: string;
  canEdit?: boolean;
  onContentChange: () => void;
}

export function CourseContent({ courseId, canEdit = false, onContentChange }: Props) {
  const [labs, setLabs] = useState<CourseLab[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLabs();
  }, [courseId]);

  const loadLabs = async () => {
    try {
      const labsData = await fetchCourseLabs(courseId);
      setLabs(labsData);
    } catch (error) {
      console.error('Failed to load labs:', error);
      toast.error('Failed to load labs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading lab activities...</div>;
  }

  return (
    <CourseLabs
      courseId={courseId}
      labs={labs}
      canEdit={canEdit}
      onLabsChange={loadLabs}
    />
  );
}