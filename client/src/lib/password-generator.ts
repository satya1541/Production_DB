/**
 * Secure password generation utilities
 */

export interface PasswordGeneratorOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

/**
 * Generate a secure password based on options
 */
export function generatePassword(options: PasswordGeneratorOptions): string {
  let charset = '';
  let password = '';
  
  // Build charset
  if (options.includeLowercase) charset += LOWERCASE;
  if (options.includeUppercase) charset += UPPERCASE;
  if (options.includeNumbers) charset += NUMBERS;
  if (options.includeSymbols) charset += SYMBOLS;
  
  if (charset.length === 0) {
    throw new Error('At least one character type must be selected');
  }
  
  // Ensure at least one character from each selected type
  if (options.includeLowercase) {
    password += getRandomChar(LOWERCASE);
  }
  if (options.includeUppercase) {
    password += getRandomChar(UPPERCASE);
  }
  if (options.includeNumbers) {
    password += getRandomChar(NUMBERS);
  }
  if (options.includeSymbols) {
    password += getRandomChar(SYMBOLS);
  }
  
  // Fill remaining length with random characters
  while (password.length < options.length) {
    password += getRandomChar(charset);
  }
  
  // Shuffle the password to avoid predictable patterns
  return shuffleString(password);
}

/**
 * Get a cryptographically secure random character from charset
 */
function getRandomChar(charset: string): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return charset[array[0] % charset.length];
}

/**
 * Shuffle a string using Fisher-Yates algorithm
 */
function shuffleString(str: string): string {
  const array = str.split('');
  for (let i = array.length - 1; i > 0; i--) {
    const randomValues = new Uint32Array(1);
    crypto.getRandomValues(randomValues);
    const j = randomValues[0] % (i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.join('');
}

/**
 * Calculate password strength score (0-4)
 */
export function calculatePasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  
  // Length checks
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  
  // Character variety checks
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  // Bonus for very long passwords
  if (password.length >= 20) score++;
  
  // Cap at 4
  score = Math.min(score, 4);
  
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['bg-red-500 text-red-400', 'bg-orange-500 text-orange-400', 'bg-yellow-500 text-yellow-400', 'bg-blue-500 text-blue-400', 'bg-green-500 text-green-400'];
  
  return {
    score,
    label: labels[score] || 'Very Weak',
    color: colors[score] || 'bg-red-500 text-red-400'
  };
}

/**
 * Generate a default strong password
 */
export function generateStrongPassword(): string {
  return generatePassword({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true
  });
}
