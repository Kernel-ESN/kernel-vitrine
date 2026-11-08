import { FileRule, fileProblem } from '@shared/validation/file-check';
import { SavedListing } from '@features/listings/models/saved-listing';

export interface ApplicationSubmission {
  /** Fichier joint à cette candidature, ou null pour reprendre le CV enregistré. */
  readonly cv: File | null;
  readonly letter: string;
  /** Garde le fichier joint dans le compte pour les prochaines candidatures. */
  readonly keepCv: boolean;
}

export interface SavedCv {
  readonly name: string;
  readonly sizeBytes: number;
  readonly updatedAt: string;
}

export interface Application {
  readonly id: string;
  readonly listing: SavedListing;
  readonly userId: string;
  readonly status: 'ENVOYEE';
  readonly createdAt: string;
  readonly documents: readonly string[];
}

export const MAX_CV_BYTES = 5_000_000;

const CV_RULE: FileRule = {
  types: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  maxBytes: MAX_CV_BYTES,
};

export const cvError = (file: { readonly size: number; readonly type: string } | null) =>
  fileProblem(file, CV_RULE);
