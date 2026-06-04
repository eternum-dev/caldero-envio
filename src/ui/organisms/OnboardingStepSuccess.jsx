import PropTypes from 'prop-types';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';

/**
 * Step 4 of onboarding: success screen confirming setup is complete,
 * with a CTA to navigate into the main app.
 * Pure presentational — calls onNavigate to let the orchestrator handle routing.
 */
export default function OnboardingStepSuccess({ onNavigate }) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon name="check" className="w-8 h-8 text-secondary" />
      </div>
      <h3 className="text-xl font-semibold text-on_surface mb-2">¡Todo listo!</h3>
      <p className="text-on-surface-variant mb-6">
        Tu local está configurado. Ya puedes comenzar a calcular envíos.
      </p>
      <Button variant="primary" size="lg" onClick={onNavigate}>
        Ir a la app
      </Button>
    </div>
  );
}

OnboardingStepSuccess.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};