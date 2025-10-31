export interface Address {
  line1: string;
  line2: string;
  state: string;
  city: string;
  pin: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  linkedinUrl: string;
  gender: string;
  address: Address;
}
