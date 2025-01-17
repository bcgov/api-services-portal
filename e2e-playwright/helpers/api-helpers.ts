import { APIRequestContext } from '@playwright/test';

let requestBody: any = {};
let headers: Record<string, string> = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

export function setRequestBody(body: any) {
  requestBody = body;
}

export function setHeaders(newHeaders: Record<string, string>) {
  headers = { ...headers, ...newHeaders };
}

export async function callAPI(
  request: APIRequestContext,
  endpoint: string,
  method: string
) {
  const options: any = {
    method,
    headers,
  };

  if (method.toUpperCase() === 'PUT' || method.toUpperCase() === 'POST') {
    options.data = JSON.stringify(requestBody);
  }
  
  // console.log(`Endpoint: ds/api/v3/${endpoint}`);
  const response = await request.fetch(`/ds/api/v3/${endpoint}`, options);
  
  let responseBody;
  try {
    responseBody = await response.json();
  } catch (e) {
    responseBody = null;
  }

  return {
    apiRes: {
      status: response.status(),
      body: responseBody
    }
  };
}