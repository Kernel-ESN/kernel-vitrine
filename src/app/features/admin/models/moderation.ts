import { OrganizationType, Verification } from '@features/auth/models/user';
import { ApplyMode, ListingStatus, ListingType, Universe } from '@features/listings/models/listing';

export interface ModerationListing {
  readonly id: string;
  readonly slug: string;
  readonly universe: Universe;
  readonly type: ListingType;
  readonly title: string;
  readonly summary: string;
  readonly description: string;
  readonly organization: {
    readonly id: string;
    readonly name: string;
    readonly verification: Verification;
  };
  readonly submittedBy?: string;
  readonly sectorId: string;
  readonly regionId: string;
  readonly city: string;
  readonly deadline: string;
  readonly applyMode: ApplyMode;
  readonly applyEmail?: string;
  readonly applyUrl?: string;
  readonly instructions: string;
  readonly budget?: number;
  readonly status: ListingStatus;
  readonly updatedAt: string;
}

export interface ModerationOrganization {
  readonly id: string;
  readonly name: string;
  readonly type: OrganizationType;
  readonly verification: Verification;
  readonly contactPhone?: string;
  readonly contactEmail?: string;
  readonly documentName?: string;
  readonly createdAt: string;
}
