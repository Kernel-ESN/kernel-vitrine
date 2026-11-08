import { afterNextRender, Directive, ElementRef, inject, Injector } from '@angular/core';
import { ControlContainer } from '@angular/forms';

/** À l'envoi d'un formulaire invalide, place le focus sur le premier champ à corriger. */
@Directive({
  selector: 'form[appFocusInvalid]',
  host: { '(submit)': 'onSubmit()' },
})
export class FocusInvalidDirective {
  private readonly host = inject<ElementRef<HTMLFormElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly container = inject(ControlContainer, { self: true });

  protected onSubmit(): void {
    if (this.container.control?.invalid) {
      afterNextRender(
        () => this.host.nativeElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
        { injector: this.injector },
      );
    }
  }
}
