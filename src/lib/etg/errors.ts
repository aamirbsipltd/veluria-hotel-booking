export class EtgApiError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'EtgApiError';
  }
}

export class EtgNetworkError extends Error {
  constructor(public cause: unknown, message: string) {
    super(message);
    this.name = 'EtgNetworkError';
  }
}
