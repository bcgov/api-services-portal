export interface AccountDetails {
  user: UserDetails;
  institution: InstitutionDetails;
}

export interface UserDetails {
  guid: string;
  displayName: string;
  firstname: string;
  surname: string;
  email: string;
  isSuspended?: boolean;
  isManagerDisabled?: boolean;
}

export interface InstitutionDetails {
  guid: string;
  type: string;
  legalName: string;
  address?: AddressDetails;
  isSuspended?: boolean;
  businessTypeOther?: string;
}

export interface AddressDetails {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postal: string;
  province: string;
  country: string;
}
