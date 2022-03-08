export interface BatchResult {
  status: number;
  result: string;
  reason?: string;
  id?: string;
  childResults?: BatchResult[];
}
