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
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <div className="w-16 h-16 bg-gold-bg border border-gold/25 rounded-full flex items-center justify-center">
        <Icon name="check" className="w-8 h-8 text-gold" />
      </div>
      <h2 className="font-display text-display-sm font-semibold text-ink">¡Todo listo!</h2>
      <p className="font-sans text-sm text-muted">
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
