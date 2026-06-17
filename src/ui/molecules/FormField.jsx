import Input from '../atoms/Input';
import Label from '../atoms/Label';

export default function FormField({ label, error, required = false, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-0 ${className}`}>
      {label && <Label required={required}>{label}</Label>}
      <Input error={error} {...props} />
      {error && <span className="text-[11px] text-danger mt-1">{error}</span>}
    </div>
  );
}
