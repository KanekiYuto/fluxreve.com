import { auth } from './auth';
import type { UserType } from '@/config/constants';

// Better Auth 类型扩展
export type Session = typeof auth.$Infer.Session.session & {
  user: typeof auth.$Infer.Session.user & {
    userType: UserType;
    isAdmin: boolean;
    registrationIp?: string | null;
    registrationCountry?: string | null;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
    utmContent?: string | null;
    utmTerm?: string | null;
  };
};
