export interface BatchResult {
  status: number;
  result: string;
  id?: string;
  childResults?: BatchResult[];
}
