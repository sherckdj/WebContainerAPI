import { CreateUserData } from '../types/user';

export function parseCSV(csvContent: string): CreateUserData[] {
  const lines = csvContent.split('\n');
  const headers = lines[0].toLowerCase().split(',');
  
  // Validate headers
  const requiredFields = ['email', 'password', 'role'];
  const missingFields = requiredFields.filter(field => !headers.includes(field));
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  const users: CreateUserData[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',');
    const user: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      user[header.trim()] = values[index]?.trim() || '';
    });
    
    // Validate role
    if (!['student', 'instructor', 'admin'].includes(user.role)) {
      throw new Error(`Invalid role "${user.role}" on line ${i + 1}`);
    }
    
    users.push({
      email: user.email,
      password: user.password,
      role: user.role as CreateUserData['role']
    });
  }
  
  return users;
}