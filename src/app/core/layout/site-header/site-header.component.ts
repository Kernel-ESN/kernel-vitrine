import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ChevronDown, Menu, X } from 'lucide-angular';
import { filter } from 'rxjs';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { LogoComponent } from '@shared/ui/logo/logo.component';
import {
  AUDIENCE_NAV,
  EXPERTISE_NAV,
  METHOD_NAV,
  OFFER_NAV,
  PLATFORM_NAV,
} from '../../config/navigation';

export type HeaderPanel = 'expertises' | 'offres' | 'clients' | 'annonces' | 'methode';

const PLATFORM_URL =
  /^\/(annonces|emplois|marches|autres|alertes|connexion|inscription|compte|employeur|moderation|organisations)(\/|\?|$)/;

export const isPlatformUrl = (url: string): boolean => PLATFORM_URL.test(url);
export const isMethodUrl = (url: string): boolean => /^\/methode(\/|\?|#|$)/.test(url);

@Component({
  selector: 'app-site-header',
  imports: [IconComponent, LogoComponent, RouterLink, RouterLinkActive],
  templateUrl: './site-header.component.html',
  styleUrl: './site-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'closeAll()',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class SiteHeaderComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly expertises = EXPERTISE_NAV;
  protected readonly audiences = AUDIENCE_NAV;
  protected readonly platform = PLATFORM_NAV;
  protected readonly method = METHOD_NAV;
  protected readonly offers = OFFER_NAV.filter((offer) => offer.featured);
  protected readonly icons = { chevron: ChevronDown, menu: Menu, close: X };

  protected readonly panel = signal<HeaderPanel | null>(null);
  protected readonly menuOpen = signal(false);
  /** « Annonces » reste actif sur toutes les pages de la plateforme. */
  protected readonly onPlatform = signal(false);
  protected readonly onMethod = signal(false);
  protected readonly onOffers = signal(false);

  constructor() {
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe((event) => {
        this.onPlatform.set(isPlatformUrl(event.urlAfterRedirects));
        this.onMethod.set(isMethodUrl(event.urlAfterRedirects));
        this.onOffers.set(/^\/offres(\/|\?|#|$)/.test(event.urlAfterRedirects));
        this.closeAll();
      });
  }

  protected togglePanel(name: HeaderPanel): void {
    this.panel.update((current) => (current === name ? null : name));
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
    this.panel.set(null);
  }

  protected closeAll(): void {
    this.panel.set(null);
    this.menuOpen.set(false);
  }

  protected onDocumentClick(event: Event): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.closeAll();
    }
  }
}
