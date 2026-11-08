import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MapPin, Search } from 'lucide-angular';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { LISTINGS_TEXT } from '../listings.text';
import { REGIONS } from '../models/listing';

export interface ListingSearchInput {
  readonly text: string;
  readonly region: string;
}

/** Deux questions, comme sur les grands sites d'emploi : quoi, et où. */
@Component({
  selector: 'app-search-box',
  imports: [IconComponent],
  templateUrl: './search-box.component.html',
  styleUrl: './search-box.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBoxComponent {
  readonly value = input('');
  readonly region = input('');
  readonly searched = output<ListingSearchInput>();

  protected readonly text = LISTINGS_TEXT.search;
  protected readonly icons = { search: Search, place: MapPin };
  protected readonly regions = REGIONS;

  protected submit(event: Event, field: HTMLInputElement, place: HTMLSelectElement): void {
    event.preventDefault();
    this.searched.emit({ text: field.value.trim(), region: place.value });
  }
}
