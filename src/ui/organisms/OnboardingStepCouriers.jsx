import PropTypes from 'prop-types';
import FormField from '../molecules/FormField';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';

/**
 * Step 2 of onboarding: add and remove couriers with name and phone fields.
 * Pure presentational — all state lives in the parent orchestrator.
 */
export default function OnboardingStepCouriers({
  couriers,
  newCourier,
  courierErrors,
  onNewCourierChange,
  onAddCourier,
  onRemoveCourier,
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="font-sans text-sm text-muted">
        Agrega los repartidores que realizarán entregas.
      </p>

      <div className="flex gap-2 items-end">
        <FormField
          label="Nombre"
          value={newCourier.name}
          onChange={e => {
            onNewCourierChange({ ...newCourier, name: e.target.value });
          }}
          placeholder="Juan Pérez"
          className="flex-1"
          error={courierErrors.nameError}
        />
        <FormField
          label="Teléfono"
          value={newCourier.phone}
          onChange={e => {
            onNewCourierChange({ ...newCourier, phone: e.target.value });
          }}
          placeholder="+54 11 9876-5432"
          className="flex-1"
          error={courierErrors.phoneError}
        />
        <Button type="button" variant="secondary" onClick={onAddCourier} className="mb-[1px]">
          <Icon name="plus" className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {couriers.map(courier => (
          <div
            key={courier.id}
            className="bg-surface-2 border border-gold/18 rounded-sm px-3.5 py-2.5 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Icon name="user" className="w-4 h-4 text-gold" />
              <div>
                <p className="font-sans text-sm font-medium text-ink">{courier.name}</p>
                <p className="font-sans text-xs text-muted">{courier.phone}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemoveCourier(courier.id)}
            >
              <Icon name="x" className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

OnboardingStepCouriers.propTypes = {
  couriers: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.string, name: PropTypes.string, phone: PropTypes.string })
  ).isRequired,
  newCourier: PropTypes.shape({ name: PropTypes.string, phone: PropTypes.string }).isRequired,
  courierErrors: PropTypes.shape({
    nameError: PropTypes.string,
    phoneError: PropTypes.string,
  }).isRequired,
  onNewCourierChange: PropTypes.func.isRequired,
  onAddCourier: PropTypes.func.isRequired,
  onRemoveCourier: PropTypes.func.isRequired,
};
