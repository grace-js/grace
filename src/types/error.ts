export class FrameworkError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class APIError extends FrameworkError {
  public code: number;
  public body: any;
  public error: any;

  constructor(code: number, body: any, error?: any, message?: string) {
    super(message ?? body.message ?? "Internal server error");

    this.code = code;
    this.body = body;
    this.error = error;
  }
}
