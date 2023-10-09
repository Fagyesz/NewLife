export class User {
  uid?: string;
  email?: string;
  displayName?: string | null;
  photoURL?: string | null;
  emailVerified?: boolean;
  role?: string;
  title?:string|null;
  description?:string|null;
  active?:boolean;
  language?:string|null;
}
