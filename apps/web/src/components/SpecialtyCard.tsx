import type { Specialty } from '../services/specialties.types';

type SpecialtyCardProps = {
  specialty: Specialty;
};

export function SpecialtyCard({ specialty }: SpecialtyCardProps) {
  return (
    <li className="specialty-card">
      <span className="specialty-card__mark" aria-hidden="true">
        {specialty.name.charAt(0).toUpperCase()}
      </span>
      <h3 className="specialty-card__name">{specialty.name}</h3>
      {specialty.description && (
        <p className="specialty-card__description">{specialty.description}</p>
      )}
    </li>
  );
}
