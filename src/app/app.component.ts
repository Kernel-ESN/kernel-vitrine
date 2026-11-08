import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteFooterComponent } from '@core/layout/site-footer/site-footer.component';
import { SiteHeaderComponent } from '@core/layout/site-header/site-header.component';
import { NavigationProgressComponent } from '@core/navigation/navigation-progress.component';
import { PageMetaService } from '@core/seo/page-meta.service';

@Component({
  selector: 'app-root',
  imports: [NavigationProgressComponent, RouterOutlet, SiteFooterComponent, SiteHeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor() {
    inject(PageMetaService).start();
  }

  protected skipToContent(event: Event, main: HTMLElement): void {
    event.preventDefault();
    main.focus();
  }
}
