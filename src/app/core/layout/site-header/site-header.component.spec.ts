import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { isMethodUrl, isPlatformUrl, SiteHeaderComponent } from './site-header.component';

describe('SiteHeaderComponent', () => {
  async function setup() {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(SiteHeaderComponent);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    document.body.appendChild(root);
    return { fixture, root };
  }

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('garde les liens des menus dans le HTML pour les moteurs de recherche', async () => {
    const { root } = await setup();
    expect(root.querySelector('#panel-expertises a[href="/services/cloud"]')).not.toBeNull();
    expect(root.querySelector('#panel-clients a[href="/ong"]')).not.toBeNull();
  });

  it('ouvre un seul grand menu à la fois et met à jour aria-expanded', async () => {
    const { fixture, root } = await setup();
    const expertises = root.querySelector<HTMLButtonElement>('[aria-controls=panel-expertises]')!;
    const clients = root.querySelector<HTMLButtonElement>('[aria-controls=panel-clients]')!;
    const panelExpertises = root.querySelector<HTMLElement>('#panel-expertises')!;
    const panelClients = root.querySelector<HTMLElement>('#panel-clients')!;
    expect(panelExpertises.hidden).toBe(true);

    expertises.click();
    await fixture.whenStable();
    expect(panelExpertises.hidden).toBe(false);
    expect(expertises.getAttribute('aria-expanded')).toBe('true');

    clients.click();
    await fixture.whenStable();
    expect(panelExpertises.hidden).toBe(true);
    expect(panelClients.hidden).toBe(false);
  });

  it('ferme le menu avec Échap et sur un clic extérieur', async () => {
    const { fixture, root } = await setup();
    const panel = root.querySelector<HTMLElement>('#panel-expertises')!;
    root.querySelector<HTMLButtonElement>('button.nav__item')!.click();
    await fixture.whenStable();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();
    expect(panel.hidden).toBe(true);

    root.querySelector<HTMLButtonElement>('button.nav__item')!.click();
    await fixture.whenStable();
    document.body.click();
    await fixture.whenStable();
    expect(panel.hidden).toBe(true);
  });

  it('ouvre le menu mobile et change le nom accessible du bouton', async () => {
    const { fixture, root } = await setup();
    const toggle = root.querySelector<HTMLButtonElement>('.header__toggle')!;
    expect(toggle.getAttribute('aria-label')).toBe('Ouvrir le menu');
    toggle.click();
    await fixture.whenStable();
    expect(root.querySelector('nav')?.classList.contains('nav--open')).toBe(true);
    expect(toggle.getAttribute('aria-label')).toBe('Fermer le menu');
  });

  it("n'affiche pas de lien Références tant qu'il n'y a pas de références réelles", async () => {
    const { root } = await setup();
    expect(root.textContent).not.toContain('Références');
  });
});

describe('isPlatformUrl', () => {
  it('reconnaît les pages de la plateforme, pas celles de la vitrine', () => {
    expect(isPlatformUrl('/marches/ao-reseau-0001')).toBe(true);
    expect(isPlatformUrl('/annonces/recherche?q=x')).toBe(true);
    expect(isPlatformUrl('/emplois')).toBe(true);
    expect(isPlatformUrl('/services/data')).toBe(false);
    expect(isPlatformUrl('/entreprises')).toBe(false);
    expect(isPlatformUrl('/')).toBe(false);
  });
});

describe('menu Offres', () => {
  it('présente les offres phares et le catalogue complet', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(SiteHeaderComponent);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const links = [...root.querySelectorAll('#panel-offres a')].map((a) => a.getAttribute('href'));
    expect(links[0]).toBe('/offres');
    expect(links).toContain('/offres/site-web-ong');
    expect(links).toContain('/offres/domaine-et-messagerie');
    expect(links.length).toBeLessThanOrEqual(7);
  });
});

describe('menu Méthode', () => {
  async function setup() {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(SiteHeaderComponent);
    await fixture.whenStable();
    return { fixture, root: fixture.nativeElement as HTMLElement };
  }

  it('s’ouvre comme les autres et referme le menu déjà ouvert', async () => {
    const { fixture, root } = await setup();
    const panel = root.querySelector<HTMLElement>('#panel-methode')!;
    const services = root.querySelector<HTMLButtonElement>('[aria-controls=panel-expertises]')!;
    const methode = root.querySelector<HTMLButtonElement>('[aria-controls=panel-methode]')!;
    expect(methode.textContent).toContain('Méthode');
    expect(panel.hidden).toBe(true);

    services.click();
    await fixture.whenStable();
    methode.click();
    await fixture.whenStable();
    expect(methode.getAttribute('aria-expanded')).toBe('true');
    expect(panel.hidden).toBe(false);
    expect(root.querySelector<HTMLElement>('#panel-expertises')!.hidden).toBe(true);
  });

  it('relie la page et chacune de ses sections', async () => {
    const { root } = await setup();
    const links = [...root.querySelectorAll('#panel-methode a')].map((a) => a.getAttribute('href'));
    expect(links).toEqual([
      '/methode',
      '/methode#etape-1',
      '/methode#etape-2',
      '/methode#etape-3',
      '/methode#etape-4',
      '/methode#etape-5',
      '/methode#questions',
    ]);
  });

  it('reste actif sur la page et ses sections, pas ailleurs', () => {
    expect(isMethodUrl('/methode')).toBe(true);
    expect(isMethodUrl('/methode#etape-3')).toBe(true);
    expect(isMethodUrl('/methodes-agiles')).toBe(false);
    expect(isMethodUrl('/')).toBe(false);
  });
});

describe('menu Annonces', () => {
  async function setup() {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(SiteHeaderComponent);
    await fixture.whenStable();
    return { fixture, root: fixture.nativeElement as HTMLElement };
  }

  it("s'ouvre comme Services et Pour qui, et referme les autres menus", async () => {
    const { fixture, root } = await setup();
    const panel = root.querySelector<HTMLElement>('#panel-annonces')!;
    const services = root.querySelector<HTMLButtonElement>('[aria-controls=panel-expertises]')!;
    const annonces = root.querySelector<HTMLButtonElement>('[aria-controls=panel-annonces]')!;
    expect(annonces.textContent).toContain('Annonces');
    expect(panel.hidden).toBe(true);

    services.click();
    await fixture.whenStable();
    annonces.click();
    await fixture.whenStable();
    expect(annonces.getAttribute('aria-expanded')).toBe('true');
    expect(panel.hidden).toBe(false);
    expect(root.querySelector<HTMLElement>('#panel-expertises')!.hidden).toBe(true);
  });

  it('relie toutes les entrées de la plateforme', async () => {
    const { root } = await setup();
    const links = [...root.querySelectorAll('#panel-annonces a')].map((a) =>
      a.getAttribute('href'),
    );
    expect(links).toEqual([
      '/annonces',
      '/employeur',
      '/emplois',
      '/marches',
      '/autres',
      '/organisations',
      '/alertes',
      '/compte',
    ]);
  });
});
