export function validatePassword(password: string): { valid: boolean; message: string } {
  if (password.length < 6) {
    return { 
      valid: false, 
      message: 'Password must be at least 6 characters long'
    };
  }
  
  return { valid: true, message: '' };
}