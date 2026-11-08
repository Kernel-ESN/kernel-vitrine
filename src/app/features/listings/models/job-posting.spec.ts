import { buildSampleListings } from '../data-access/sample-listings.data';
import { toJobPosting } from './job-posting';
import { listingLink } from './listing';

const [job] = buildSampleListings(new Date('2026-11-06T10:00:00Z'));

describe('toJobPosting', () => {
  it("n'expose jamais une annonce fictive à Google", () => {
    expect(toJobPosting(job, 'https://x.test/a')).toBeNull();
  });

  it('décrit un vrai emploi publié', () => {
    const data = toJobPosting({ ...job, isSample: false }, 'https://x.test/a');
    expect(data).toMatchObject({
      '@type': 'JobPosting',
      title: job.title,
      url: 'https://x.test/a',
      validThrough: job.deadline,
      hiringOrganization: { name: job.organization.name },
    });
  });

  it('ignore un marché et une annonce non publiée', () => {
    expect(toJobPosting({ ...job, isSample: false, universe: 'MARCHE' }, 'u')).toBeNull();
    expect(toJobPosting({ ...job, isSample: false, status: 'EN_ATTENTE' }, 'u')).toBeNull();
  });

  it('produit une adresse lisible', () => {
    expect(listingLink(job).join('/')).toMatch(/^\/\/emplois\/cdi-comptable-confirme-niamey-0001$/);
  });
});
