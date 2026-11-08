import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ArrowRight, BellRing, Bookmark, LogOut, Send, X } from 'lucide-angular';
import { AuthApi } from '@features/auth/data-access/auth.api';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { TocItem } from '@shared/ui/toc/toc.component';
import { EmptyStateComponent } from '@shared/ui/workspace/empty-state.component';
import { PanelComponent } from '@shared/ui/workspace/panel.component';
import { WorkspaceComponent } from '@shared/ui/workspace/workspace.component';
import { SessionStore } from '@features/auth/state/session.store';
import { formatDay } from '@features/listings/models/deadline';
import { listingLink } from '@features/listings/models/listing';
import { ACCOUNT_TEXT } from '../account.text';
import { SavedListingsApi } from '@features/listings/data-access/saved-listings.api';
import { SavedListing } from '@features/listings/models/saved-listing';
import { AccountApi } from '../data-access/account.api';
import { Application } from '../models/account';
import { ProfileFormComponent } from '../ui/profile-form.component';
import { SavedCvComponent } from '../ui/saved-cv.component';

@Component({
  selector: 'app-account',
  imports: [
    EmptyStateComponent,
    IconComponent,
    PanelComponent,
    ProfileFormComponent,
    RouterLink,
    SavedCvComponent,
    WorkspaceComponent,
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountComponent {
  private readonly api = inject(AccountApi);
  private readonly savedApi = inject(SavedListingsApi);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthApi);

  protected readonly session = inject(SessionStore);
  protected readonly text = ACCOUNT_TEXT;
  protected readonly link = listingLink;
  protected readonly day = formatDay;
  protected readonly saved = signal<readonly SavedListing[]>([]);
  protected readonly applications = signal<readonly Application[]>([]);
  protected readonly icons = {
    arrow: ArrowRight,
    alerts: BellRing,
    logout: LogOut,
    remove: X,
    saved: Bookmark,
    applications: Send,
  };
  protected readonly roleLabel = computed(() => {
    const role = this.session.user()?.role;
    return role ? this.text.roles[role] : '';
  });
  protected readonly sections: readonly TocItem[] = [
    { id: 'informations', label: ACCOUNT_TEXT.profileTitle },
    { id: 'cv', label: ACCOUNT_TEXT.cvTitle },
    { id: 'candidatures', label: ACCOUNT_TEXT.applicationsTitle },
    { id: 'enregistrees', label: ACCOUNT_TEXT.savedTitle },
  ];

  constructor() {
    if (this.session.loggedIn()) {
      this.savedApi.list().subscribe((items) => this.saved.set(items));
      this.api.applications().subscribe((items) => this.applications.set(items));
    }
  }

  protected unsave(listing: SavedListing): void {
    this.savedApi.set(listing, false).subscribe((items) => this.saved.set(items));
  }

  protected logout(): void {
    const leave = () => {
      this.session.close();
      void this.router.navigateByUrl('/annonces');
    };
    // Même si le serveur ne répond pas, on ne laisse pas la personne connectée à l'écran.
    this.auth.logout().subscribe({ next: leave, error: leave });
  }
}
