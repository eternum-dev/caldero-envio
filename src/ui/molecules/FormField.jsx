import Input from '../atoms/Input';
import Label from '../atoms/Label';
import Icon from '../atoms/Icon';
import HelpHint from './HelpHint';

export default function FormField({
  label,
  icon,
  hint,
  error,
  required = false,
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-0 ${className}`}>
      {(label || icon || hint) && (
        <div className="flex items-center gap-2 mb-1.5">
          {icon && <Icon name={icon} className="w-4 h-4 text-gold-dim" />}
          {label && (
            <Label required={required} className="mb-0">
              {label}
            </Label>
          )}
          {hint && <HelpHint text={hint} />}
        </div>
      )}
      <Input error={error} {...props} />
      {error && <span className="text-[11px] text-danger mt-1">{error}</span>}
    </div>
  );
}
