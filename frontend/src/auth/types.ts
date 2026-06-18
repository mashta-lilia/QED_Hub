export type AuthViewState =
  | { view: 'login' }
  | { view: 'signup' }
  | { view: 'verify_email'; email: string; verificationToken?: string }
  | { view: 'forgot_password' };

export interface RegistrationPayload {
  email: string;
  password: string;
  clientVerificationHash: string;
  recaptchaToken?: string;
}

export interface VerificationPayload {
  email: string;
  token: string;
}

export interface TokenValidationResponse {
  valid: boolean;
  message: string;
  remainingAttempts: number;
  cooldownPeriod?: number;
}

export interface AuthenticatedUser {
  email: string;
  provider: 'password' | 'google';
}

export interface PasswordChecks {
  minLength: boolean;
  uppercase: boolean;
  lowercase: boolean;
  numeric: boolean;
  special: boolean;
  maxLength: boolean;
  notCommon: boolean;
  noSequential: boolean;
  noRepeated: boolean;
  notEmailDerived: boolean;
}

export interface AuthResult {
  ok: boolean;
  message: string;
  user?: AuthenticatedUser;
  verification?: {
    sessionId: string;
    expiryTime: number;
  };
}
