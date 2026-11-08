import { toContactRequest } from './contact-request';

describe('toContactRequest', () => {
  it('nettoie les espaces et remplace les champs facultatifs vides par null', () => {
    expect(
      toContactRequest({
        subject: 'devis',
        service: 'cloud',
        name: '  Awa Moussa ',
        organization: '   ',
        audience: 'ong',
        email: ' awa@example.org ',
        phone: '',
        message: ' Bonjour. ',
      }),
    ).toEqual({
      subject: 'devis',
      service: 'cloud',
      name: 'Awa Moussa',
      organization: null,
      audience: 'ong',
      email: 'awa@example.org',
      phone: null,
      message: 'Bonjour.',
    });
  });
});
