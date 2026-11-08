import { TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { Component } from '@angular/core';
import { PageMetaService } from './page-meta.service';

@Component({ template: '' })
class BlankComponent {}

describe('PageMetaService', () => {
  it('applique le titre et la description de la route affichée', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'a',
            component: BlankComponent,
            title: 'Page A',
            data: { description: 'Texte A' },
          },
        ]),
      ],
    });
    TestBed.inject(PageMetaService).start();
    await TestBed.inject(Router).navigateByUrl('/a');

    const meta = TestBed.inject(Meta);
    expect(meta.getTag('name="description"')?.content).toBe('Texte A');
    expect(meta.getTag('property="og:description"')?.content).toBe('Texte A');
    expect(meta.getTag('property="og:title"')?.content).toBe('Page A');
  });
});
