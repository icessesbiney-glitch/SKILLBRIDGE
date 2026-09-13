import { getAuthFeedbackMessage } from './authFeedback';

describe('getAuthFeedbackMessage', () => {
  it('maps invalid login credentials to a helpful sign-in message', () => {
    expect(getAuthFeedbackMessage(new Error('Invalid login credentials'), false)).toBe(
      'Authentication failed. Check your email and password, then try again.',
    );
  });

  it('maps unconfirmed email errors to confirmation guidance', () => {
    expect(getAuthFeedbackMessage(new Error('Email not confirmed'), false)).toBe(
      'Check your inbox and confirm your email before signing in.',
    );
  });

  it('maps weak password errors during sign-up to a stronger-password message', () => {
    expect(getAuthFeedbackMessage(new Error('Password should be at least 6 characters'), true)).toBe(
      'Your password does not meet the current requirements. Please choose a stronger password.',
    );
  });
});
