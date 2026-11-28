import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSpecialties } from './specialties.service';

describe('getSpecialties', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns specialties when the response is valid', async () => {
    const mockData = {
      status: 'ok',
      data: [
        {
          id: '1',
          name: 'Cardiology',
          slug: 'cardiology',
          description: 'Heart care',
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockData),
    } as unknown as Response);

    const result = await getSpecialties();

    expect(result).toEqual(mockData);
  });
  it('throws an error when response data is null', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        status: 'ok',
        data: null,
      }),
    } as unknown as Response);

    await expect(getSpecialties()).rejects.toThrow(
      'Invalid specialties response',
    );
  });
  it('throws an error when a specialty has missing fields', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        status: 'ok',
        data: [
          {
            id: '1',
            name: 'Cardiology',
            slug: 'cardiology',
            // description is missing
          },
        ],
      }),
    } as unknown as Response);

    await expect(getSpecialties()).rejects.toThrow(
      'Invalid specialties response',
    );
  });
  it('throws an error when response status is invalid', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        status: 'error',
        data: [],
      }),
    } as unknown as Response);

    await expect(getSpecialties()).rejects.toThrow(
      'Invalid specialties response',
    );
  });
});
