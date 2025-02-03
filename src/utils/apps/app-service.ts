import { supabase } from '../../lib/supabase';
import { 
  App, 
  AppInstance, 
  AppSubmission,
  CreateAppData,
  CreateAppInstanceData,
  CreateAppSubmissionData,
  SubmissionGradeData
} from '../../types/app';

export async function fetchApps(): Promise<App[]> {
  const { data, error } = await supabase
    .from('apps')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function createApp(appData: CreateAppData): Promise<App> {
  const { data, error } = await supabase
    .from('apps')
    .insert([appData])
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create app');
  return data;
}

export async function updateApp(
  id: string,
  updates: Partial<CreateAppData>
): Promise<App> {
  const { data, error } = await supabase
    .from('apps')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to update app');
  return data;
}

export async function deleteApp(id: string): Promise<void> {
  const { error } = await supabase
    .from('apps')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function createAppInstance(instanceData: CreateAppInstanceData): Promise<AppInstance> {
  const { data: appInstance, error: instanceError } = await supabase
    .from('app_instances')
    .insert([instanceData])
    .select(`
      *,
      app:apps(*)
    `)
    .single();

  if (instanceError) throw instanceError;
  if (!appInstance) throw new Error('Failed to create app instance');

  const { error: contentError } = await supabase
    .from('course_content')
    .insert([{
      course_id: instanceData.course_id,
      title: instanceData.title,
      content: instanceData.config.description || '',
      app_instance_id: appInstance.id
    }]);

  if (contentError) {
    await supabase
      .from('app_instances')
      .delete()
      .eq('id', appInstance.id);
    throw contentError;
  }

  return appInstance;
}

export async function fetchAppInstance(id: string): Promise<AppInstance> {
  const { data, error } = await supabase
    .from('app_instances')
    .select(`
      *,
      app:apps(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  if (!data) throw new Error('App instance not found');
  return data;
}

export async function updateAppInstance(
  id: string,
  updates: Partial<CreateAppInstanceData>
): Promise<AppInstance> {
  const { data, error } = await supabase
    .from('app_instances')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      app:apps(*)
    `)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to update app instance');
  return data;
}

export async function deleteAppInstance(id: string): Promise<void> {
  const { error } = await supabase
    .from('app_instances')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function createAppSubmission(submissionData: CreateAppSubmissionData): Promise<AppSubmission> {
  const { data, error } = await supabase
    .from('app_submissions')
    .insert([submissionData])
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create submission');
  return data;
}

export async function submitGrade(submissionData: SubmissionGradeData): Promise<AppSubmission> {
  try {
    // Validate the submission data
    if (!submissionData.instance_id || !submissionData.user_id || submissionData.points === undefined) {
      throw new Error('Missing required fields');
    }

    if (submissionData.points < 0 || submissionData.points > 100) {
      throw new Error('Points must be between 0 and 100');
    }

    // Update or create submission
    const { data, error } = await supabase
      .from('app_submissions')
      .upsert({
        instance_id: submissionData.instance_id,
        user_id: submissionData.user_id,
        submission_data: { points: submissionData.points },
        grade: submissionData.points,
        status: 'graded',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'instance_id,user_id'
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to save submission');

    return data;
  } catch (error) {
    console.error('Error submitting grade:', error);
    throw error;
  }
}