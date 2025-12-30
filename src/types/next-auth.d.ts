import { DefaultSession } from 'next-auth';
import { Role, UserStatus } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role;
      status: UserStatus;
      businessName?: string;
      industry?: string;
    } & DefaultSession['user'];
  }

  interface User {
    role: Role;
    status: UserStatus;
    businessName?: string;
    industry?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: Role;
    status: UserStatus;
    businessName?: string;
    industry?: string;
  }
}
