import { useCallback, useEffect, useState } from 'react';
import { getSpecialties } from '../services/specialties.service';
import type { Specialty } from '../services/specialties.types';

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

    async function fetchSpecialties() {
      setState({ status: 'loading' });

      try {
        const response = await getSpecialties(controller.signal);

        setState({
          status: 'success',
          data: response.data,
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          status: 'error',
          message:
            error instanceof Error ? error.message : 'Something went wrong',
        });
      }
    }

    void fetchSpecialties();

    return () => {
      controller.abort();
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
