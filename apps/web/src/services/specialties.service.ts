// This File to connect with backend
import { env } from '../config/env';
import type { SpecialtiesResponse } from './specialties.types';

export async function getSpecialties(
  signal?: AbortSignal,
): Promise<SpecialtiesResponse> {
  const response = await fetch(`${env.apiUrl}/api/specialties`, {
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch specialties: ${response.status}`);
  }

  return response.json() as Promise<SpecialtiesResponse>;
}
