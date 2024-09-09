export class WorkflowError extends Error {
  public shouldTurnOffWorkflow: boolean;
  public originalError?: Error;

  constructor(message: string, shouldTurnOffWorkflow: boolean, originalError?: Error) {
    super(message);
    this.name = 'WorkflowError';
    this.shouldTurnOffWorkflow = shouldTurnOffWorkflow;
    this.originalError = originalError;
  }
}