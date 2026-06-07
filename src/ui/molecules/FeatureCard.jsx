import Icon from '../atoms/Icon';

/**
 * Feature card for landing page (icon + title + description).
 *
 * @param {{ icon: string, title: string, description: string, className?: string }} props
 */
export default function FeatureCard({ icon, title, description, className = '' }) {
  return (
    <div
      className={`bg-surface border border-gold/18 rounded-[14px] p-6 flex flex-col gap-4 ${className}`}
    >
      <div className="w-12 h-12 bg-gold-bg border border-gold/25 rounded-full flex items-center justify-center">
        <Icon name={icon} className="w-6 h-6 text-gold" />
      </div>
      <h3 className="font-display text-display-sm font-semibold text-ink">{title}</h3>
      <p className="font-sans text-sm text-muted">{description}</p>
    </div>
  );
}
