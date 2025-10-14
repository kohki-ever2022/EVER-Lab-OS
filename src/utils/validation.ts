
export class ValidationError extends Error {
  constructor(
    public field: string,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validateEmail = (email: string): void => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(String(email).toLowerCase())) {
    throw new ValidationError('email', 'INVALID_FORMAT', 'Invalid email format');
  }
};

export const validateDateRange = (start: Date, end: Date): void => {
  if (end <= start) {
    throw new ValidationError('endTime', 'INVALID_RANGE', 'End time must be after start time');
  }
  const now = new Date();
  // Allow bookings in the very near past (e.g. 5 minutes) to account for delays
  const gracePeriod = 5 * 60 * 1000; 
  if (start.getTime() < now.getTime() - gracePeriod) {
    throw new ValidationError('startTime', 'PAST_DATE', 'Cannot create reservations in the past');
  }
};
