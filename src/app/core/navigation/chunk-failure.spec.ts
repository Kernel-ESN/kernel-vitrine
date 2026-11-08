import { isChunkFailure } from './chunk-failure';

describe('isChunkFailure', () => {
  it('reconnaît un fichier de page qui ne se charge pas', () => {
    expect(
      isChunkFailure(new TypeError('Failed to fetch dynamically imported module: /a.js')),
    ).toBe(true);
    expect(isChunkFailure(new TypeError('Importing a module script failed.'))).toBe(true);
  });

  it('laisse passer les autres erreurs', () => {
    expect(isChunkFailure(new Error('Cannot match any routes'))).toBe(false);
    expect(isChunkFailure('texte')).toBe(false);
  });
});
