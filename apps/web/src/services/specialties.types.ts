// The data format

export interface Specialty {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface SpecialtiesResponse {
  status: 'ok';
  data: Specialty[];
}
