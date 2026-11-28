import { useCallback, useEffect, useState } from 'react';
import { getSpecialties } from '../services/specialties.service';
import type { Specialty } from '../services/specialties.types';

const REQUEST_TIMEOUT_MS = 10_000;

type SpecialtiesState =
  | { status: 'loading' }
  | { status: 'success'; data: Specialty[] }
  | { status: 'error'; message: string };

export function useSpecialties() {
  const [state, setState] = useState<SpecialtiesState>({
    status: 'loading',
  });

  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let timedOut = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    async function fetchSpecialties() {
      setState({ status: 'loading' });

      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          timedOut = true;
          controller.abort();
          reject(new Error('Request timed out'));
        }, REQUEST_TIMEOUT_MS);
      });

      try {
        const response = await Promise.race([
          getSpecialties(controller.signal),
          timeoutPromise,
        ]);

        setState({
          status: 'success',
          data: response.data,
        });
      } catch (error) {
        if (controller.signal.aborted && !timedOut) {
          return;
        }

        setState({
          status: 'error',
          message: timedOut
            ? 'The request timed out. Please try again.'
            : error instanceof Error
              ? error.message
              : 'Something went wrong',
        });
      } finally {
        if (timeoutId !== undefined) {
          clearTimeout(timeoutId);
        }
      }
    }

    void fetchSpecialties();

    return () => {
      controller.abort();

      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setAttempt((current) => current + 1);
  }, []);

  return {
    ...state,
    retry,
  };
}
