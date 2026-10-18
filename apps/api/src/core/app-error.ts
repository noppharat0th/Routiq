export class AppError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly code: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class RouterSessionNotFoundError extends AppError {
  constructor() {
    super('Router session was not found or has expired.', 404, 'SESSION_NOT_FOUND');
  }
}

export class RouterAuthenticationRequiredError extends AppError {
  constructor() {
    super('Sign in to the router before requesting this resource.', 401, 'AUTH_REQUIRED');
  }
}
