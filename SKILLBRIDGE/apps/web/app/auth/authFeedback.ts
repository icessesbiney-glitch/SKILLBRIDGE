export function getAuthFeedbackMessage(error: unknown, isSignUp: boolean) {
  if (!(error instanceof Error)) {
    return isSignUp
      ? 'We could not create your account right now. Please try again in a moment.'
      : 'Authentication failed. Please try again.';
  }

  const message = error.message.toLowerCase();

  if (message.includes('invalid login credentials')) {
    return 'Authentication failed. Check your email and password, then try again.';
  }

  if (message.includes('email not confirmed')) {
    return 'Check your inbox and confirm your email before signing in.';
  }

  if (message.includes('password')) {
    return isSignUp
      ? 'Your password does not meet the current requirements. Please choose a stronger password.'
      : 'Authentication failed. Check your email and password, then try again.';
  }

  if (message.includes('already registered') || message.includes('already been registered')) {
    return 'This email already has an account. Sign in instead of creating a new one.';
  }

  return error.message;
}
