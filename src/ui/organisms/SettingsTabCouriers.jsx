import PropTypes from 'prop-types';
import FormField from '../molecules/FormField';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';

/**
 * Settings tab: courier management with add row, inline edit (edit/save/cancel), and remove.
 * Pure presentational — all state and handlers live in the parent Settings page.
 */
export default function SettingsTabCouriers({
  couriers,
  newCourier,
  editingCourierId,
  editForm,
  editErrors,
  onAdd,
  onEditClick,
  onCancelEdit,
  onSaveEdit,
  onRemove,
  onNewCourierChange,
  onEditFormChange,
  onSave,
  loading,
}) {
  return (
    <div className="bg-surface border border-gold/18 rounded-[14px] p-5 flex flex-col gap-4">
      <h3 className="font-display text-display-sm font-semibold text-ink mb-6">Repartidores</h3>

      <div className="flex gap-2 items-end">
        <FormField
          label="Nombre"
          value={newCourier.name}
          onChange={e => onNewCourierChange({ ...newCourier, name: e.target.value })}
          placeholder="Nombre"
          className="flex-1"
        />
        <FormField
          label="Teléfono"
          value={newCourier.phone}
          onChange={e => onNewCourierChange({ ...newCourier, phone: e.target.value })}
          placeholder="Teléfono"
          className="flex-1"
        />
        <Button variant="secondary" onClick={onAdd} className="mb-[1px]">
          <Icon name="plus" className="w-5 h-5" />
        </Button>
      </div>

      {couriers.length === 0 && (
        <div className="font-sans text-sm text-muted text-center py-8">
          Todavía no agregaste repartidores
        </div>
      )}

      <div className="flex flex-col gap-2">
        {couriers.map(courier => (
          <div
            key={courier.id}
            className="bg-surface-2 border border-gold/18 rounded-sm px-3.5 py-2.5"
          >
            {editingCourierId === courier.id ? (
              <div className="flex flex-col gap-3">
                <div className="flex gap-2 items-end">
                  <FormField
                    label="Nombre"
                    value={editForm.name}
                    onChange={e => onEditFormChange(prev => ({ ...prev, name: e.target.value }))}
                    error={editErrors.nameError}
                    className="flex-1"
                  />
                  <FormField
                    label="Teléfono"
                    value={editForm.phone}
                    onChange={e => onEditFormChange(prev => ({ ...prev, phone: e.target.value }))}
                    error={editErrors.phoneError}
                    className="flex-1"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={onCancelEdit}>
                    Cancelar
                  </Button>
                  <Button variant="primary" size="sm" onClick={onSaveEdit}>
                    Guardar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="primary">{courier.name.charAt(0)}</Badge>
                  <div>
                    <p className="font-sans text-sm font-medium text-ink">{courier.name}</p>
                    <p className="font-sans text-xs text-muted">{courier.phone}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onEditClick(courier)}>
                    <Icon name="edit" className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onRemove(courier.id)}>
                    <Icon name="x" className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <Button variant="primary" size="md" className="w-fit" onClick={onSave} loading={loading}>
        Guardar Cambios
      </Button>
    </div>
  );
}

SettingsTabCouriers.propTypes = {
  couriers: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.string, name: PropTypes.string, phone: PropTypes.string })
  ).isRequired,
  newCourier: PropTypes.shape({ name: PropTypes.string, phone: PropTypes.string }).isRequired,
  editingCourierId: PropTypes.string,
  editForm: PropTypes.shape({ name: PropTypes.string, phone: PropTypes.string }),
  editErrors: PropTypes.shape({ nameError: PropTypes.string, phoneError: PropTypes.string }),
  onAdd: PropTypes.func.isRequired,
  onEditClick: PropTypes.func.isRequired,
  onCancelEdit: PropTypes.func.isRequired,
  onSaveEdit: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onNewCourierChange: PropTypes.func.isRequired,
  onEditFormChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};
