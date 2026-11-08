import { FileRule } from '@shared/validation/file-check';

export type OrganizationType = 'ONG' | 'MINISTERE' | 'ENTREPRISE' | 'AUTRE';
export type UserRole = 'CANDIDAT' | 'EMPLOYEUR' | 'ADMIN';
/** Le rôle de modérateur ne s'obtient jamais par l'inscription. */
export type RegistrationRole = Exclude<UserRole, 'ADMIN'>;
export type Verification = 'EN_ATTENTE' | 'VERIFIEE' | 'REFUSEE';

export interface UserOrganization {
  readonly name: string;
  readonly type: OrganizationType;
  readonly verification: Verification;
  readonly documentName?: string;
  readonly verificationNote?: string;
}

export interface User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone?: string;
  readonly role: UserRole;
  readonly organization?: UserOrganization;
}

export interface Registration {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly role: RegistrationRole;
  readonly phone?: string;
  readonly organization?: {
    readonly name: string;
    readonly type: OrganizationType;
    /** Justificatif pour la vérification (cahier des charges §4.3). */
    readonly document: File;
  };
}

export interface ProfileChange {
  readonly name: string;
  readonly phone: string;
}

export const PHONE_PATTERN = /^\+?[0-9 ().-]{8,20}$/;

export const ORGANIZATION_DOCUMENT: FileRule = {
  types: ['application/pdf', 'image/jpeg', 'image/png'],
  maxBytes: 5_000_000,
};
