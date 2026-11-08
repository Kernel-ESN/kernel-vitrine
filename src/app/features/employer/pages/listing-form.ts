import {
  AbstractControl,
  NonNullableFormBuilder,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ApplyMode, ListingType } from '@features/listings/models/listing';

/** Une date limite doit être postérieure à aujourd'hui. */
export const futureDate =
  (now: () => Date) =>
  (control: AbstractControl): ValidationErrors | null =>
    control.value && new Date(`${control.value}T23:59:59`) <= now() ? { past: true } : null;

export function createListingForm(builder: NonNullableFormBuilder, now: () => Date) {
  return builder.group({
    type: ['' as ListingType | '', Validators.required],
    title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(140)]],
    summary: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(300)]],
    description: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(10000)]],
    sectorId: ['', Validators.required],
    regionId: ['', Validators.required],
    city: ['', [Validators.required, Validators.maxLength(80)]],
    deadline: ['', [Validators.required, futureDate(now)]],
    budget: [null as number | null, Validators.min(1)],
    applyMode: ['EN_LIGNE' as ApplyMode, Validators.required],
    applyEmail: ['', Validators.email],
    applyUrl: ['', Validators.pattern(/^https:\/\/\S+$/)],
    instructions: ['', [Validators.required, Validators.maxLength(1000)]],
  });
}
