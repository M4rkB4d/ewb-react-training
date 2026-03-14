import { AppError, ValidationError, NetworkError, BusinessError, SecurityError } from './errors';

describe('AppError', () => {
  it('stores structured error metadata', () => {
    const error = new AppError({
      message: 'Internal failure',
      code: 'INTERNAL',
      severity: 'high',
      userMessage: 'Something went wrong.',
      context: { requestId: 'req-123' },
    });

    expect(error.message).toBe('Internal failure');
    expect(error.code).toBe('INTERNAL');
    expect(error.severity).toBe('high');
    expect(error.userMessage).toBe('Something went wrong.');
    expect(error.context).toEqual({ requestId: 'req-123' });
    expect(error.name).toBe('AppError');
    expect(error).toBeInstanceOf(Error);
  });

  it('preserves the cause chain', () => {
    const cause = new Error('root cause');
    const error = new AppError({
      message: 'Wrapper',
      code: 'WRAPPED',
      severity: 'low',
      userMessage: 'Error occurred.',
      cause,
    });

    expect(error.cause).toBe(cause);
  });
});

describe('ValidationError', () => {
  it('has low severity and VALIDATION_ERROR code', () => {
    const error = new ValidationError('Invalid input');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.severity).toBe('low');
    expect(error.name).toBe('ValidationError');
    expect(error).toBeInstanceOf(AppError);
  });
});

describe('NetworkError', () => {
  it('has a user-friendly message about connectivity', () => {
    const error = new NetworkError();
    expect(error.code).toBe('NETWORK_ERROR');
    expect(error.severity).toBe('medium');
    expect(error.userMessage).toContain('internet connection');
  });
});

describe('BusinessError', () => {
  it('separates internal message from user message', () => {
    const error = new BusinessError(
      'Insufficient funds: balance 100, requested 500',
      'You do not have enough funds for this transfer.',
    );
    expect(error.message).toContain('Insufficient funds');
    expect(error.userMessage).toContain('enough funds');
    expect(error.code).toBe('BUSINESS_ERROR');
  });
});

describe('SecurityError', () => {
  it('has critical severity and a generic user message', () => {
    const error = new SecurityError('Token tampering detected', {
      ip: '192.168.1.1',
    });
    expect(error.severity).toBe('critical');
    expect(error.userMessage).toContain('contact support');
    expect(error.context).toEqual({ ip: '192.168.1.1' });
  });
});
