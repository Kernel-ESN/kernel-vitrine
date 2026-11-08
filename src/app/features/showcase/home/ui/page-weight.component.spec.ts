import { totalTransferKb, weightMessage } from './page-weight.component';

describe('poids de la page', () => {
  it('additionne les octets réellement transférés', () => {
    expect(totalTransferKb([{ transferSize: 2048 }, { transferSize: 1024 }, {}])).toBe(3);
  });

  it('ne donne aucun chiffre si le navigateur ne fournit pas la mesure', () => {
    expect(totalTransferKb([])).toBeNull();
    expect(totalTransferKb([{}])).toBeNull();
    expect(weightMessage(null)).not.toMatch(/\d/);
  });

  it('distingue une page servie depuis le cache', () => {
    expect(weightMessage(totalTransferKb([{ transferSize: 0 }]))).toContain('déjà cette page');
  });

  it('affiche le chiffre mesuré', () => {
    expect(weightMessage(412)).toBe('Cette page vient de vous coûter 412 Ko de données.');
  });
});
