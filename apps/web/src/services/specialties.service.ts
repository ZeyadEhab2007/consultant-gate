// This File to connect with backend
import { env } from '../config/env';
import type { SpecialtiesResponse, Specialty } from './specialties.types';

function isSpecialty(value: unknown): value is Specialty {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const specialty = value as Record<string, unknown>;

  return (
    typeof specialty.id === 'string' &&
    typeof specialty.name === 'string' &&
    typeof specialty.slug === 'string' &&
    (typeof specialty.description === 'string' ||
      specialty.description === null)
  );
}

function isSpecialtiesResponse(value: unknown): value is SpecialtiesResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const response = value as Record<string, unknown>;

  return (
    response.status === 'ok' &&
    Array.isArray(response.data) &&
    response.data.every(isSpecialty)
  );
}

export async function getSpecialties(
  signal?: AbortSignal,
): Promise<SpecialtiesResponse> {
  const response = await fetch(`${env.apiUrl}/api/specialties`, {
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch specialties: ${response.status}`);
  }

  const data: unknown = await response.json();

  if (!isSpecialtiesResponse(data)) {
    throw new Error('Invalid specialties response');
  }

  return data;
}
