export class User {
  uid?: string;
  email?: string;
  displayName?: string | null;
  photoURL?: string | null;
  emailVerified?: boolean;
  roles?: {
    admin:boolean;
    organizer:boolean;
  };
  title?:string;
  description?:string;
}
