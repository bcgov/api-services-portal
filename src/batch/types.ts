export interface BatchResult {
  status: number;
  result: string;
  reason?: string;
  id?: string;
  ownedBy?: string;
  childResults?: BatchResult[];
}

export class BatchSyncException extends Error {
  result: BatchResult;
  constructor(result: BatchResult) {
    super();
    this.result = result;
  }
}
