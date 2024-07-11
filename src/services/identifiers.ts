import { v4 as uuidv4 } from 'uuid';

export function isProductID(id: string): boolean {
  return id.length == 12;
}
export function isApplicationID(id: string): boolean {
  return id.length == 11 || id.length == 16;
}
export function isEnvironmentID(id: string): boolean {
  return id.length == 8;
}

export function newProductID(): string {
  return uuidv4().replace(/-/g, '').toUpperCase().substring(0, 12);
}
export function newApplicationID(): string {
  return uuidv4().replace(/-/g, '').toUpperCase().substring(0, 11);
}
export function newEnvironmentID(): string {
  return uuidv4().replace(/-/g, '').toUpperCase().substring(0, 8);
}

export function newNamespaceID(): string {
  return 'gw-' + uuidv4().replace(/-/g, '').toLowerCase().substring(0, 5);
}

export const newGatewayID = newNamespaceID;
