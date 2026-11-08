import { FocusableOption, FocusKeyManager } from '@angular/cdk/a11y';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChildren,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowRight } from 'lucide-angular';
import { EXPERTISE_NAV, ExpertiseKey } from '@core/config/navigation';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { EXPERTISES } from '../../expertises/data-access/expertises.data';

/** Une couche du schéma : le gestionnaire de clavier du CDK lui donne le focus. */
@Directive({ selector: '[appLayerTab]' })
export class LayerTabDirective implements FocusableOption {
  private readonly element = inject<ElementRef<HTMLButtonElement>>(ElementRef).nativeElement;

  focus(): void {
    this.element.focus();
  }
}

/** Ce que chaque métier tient dans l'architecture d'un système. */
const LAYER_CAPTIONS: Readonly<Record<ExpertiseKey, string>> = {
  devops: 'Code et mises en production',
  data: 'Bases, flux et indicateurs',
  cloud: 'Serveurs, hébergement, sauvegardes',
  cyber: 'Accès, comptes, surveillance',
};

/**
 * Le noyau, dessiné comme un schéma d'architecture : quatre couches, chacune un onglet.
 * Clavier conforme au modèle d'onglets du W3C : flèches, Début, Fin, activation au focus.
 */
@Component({
  selector: 'app-kernel-core',
  imports: [IconComponent, LayerTabDirective, RouterLink],
  templateUrl: './kernel-core.component.html',
  styleUrl: './kernel-core.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KernelCoreComponent {
  protected readonly arrow = ArrowRight;
  protected readonly selected = signal(0);
  protected readonly layers = EXPERTISE_NAV.map((nav) => ({
    nav,
    caption: LAYER_CAPTIONS[nav.key],
  }));
  protected readonly current = computed(() => {
    const nav = EXPERTISE_NAV[this.selected()];
    return { nav, content: EXPERTISES.find((item) => item.key === nav.key)! };
  });

  private readonly tabs = viewChildren(LayerTabDirective);
  private readonly keys = new FocusKeyManager(this.tabs, inject(Injector))
    .withVerticalOrientation()
    .withHorizontalOrientation('ltr')
    .withHomeAndEnd()
    .withWrap();

  constructor() {
    // Le gestionnaire part de la couche affichée, pas d'une position vide.
    afterNextRender(() => this.keys.updateActiveItem(this.selected()));
    const subscription = this.keys.change.subscribe((index) => this.selected.set(index));
    inject(DestroyRef).onDestroy(() => {
      subscription.unsubscribe();
      this.keys.destroy();
    });
  }

  protected select(index: number): void {
    this.selected.set(index);
    this.keys.updateActiveItem(index);
  }

  /** Un onglet atteint à la tabulation devient le point de départ des flèches. */
  protected track(index: number): void {
    this.keys.updateActiveItem(index);
  }

  protected onKeydown(event: KeyboardEvent): void {
    this.keys.onKeydown(event);
  }
}
