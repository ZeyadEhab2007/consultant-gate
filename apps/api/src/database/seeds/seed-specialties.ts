import { DataSource } from 'typeorm';

export const specialties = [
  {
    name: 'Software Engineering',
    slug: 'software-engineering',
    description: 'Software design, architecture, and engineering practices',
  },
  {
    name: 'Web Development',
    slug: 'web-development',
    description: 'Building and maintaining modern web applications',
  },
  {
    name: 'Mobile Development',
    slug: 'mobile-development',
    description: 'Developing applications for mobile platforms',
  },
  {
    name: 'Data Science & AI',
    slug: 'data-science-ai',
    description: 'Data analysis, machine learning, and artificial intelligence',
  },
  {
    name: 'Cybersecurity',
    slug: 'cybersecurity',
    description:
      'Information security, application security, and threat protection',
  },
];

export async function seedSpecialties(dataSource: DataSource) {
  for (const specialty of specialties) {
    await dataSource.query(
      `
        INSERT INTO specialties (
  name,
  slug,
  description
)
VALUES ($1, $2, $3) 
ON CONFLICT (slug)
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
      `,
      [specialty.name, specialty.slug, specialty.description],
    );
  }
}
