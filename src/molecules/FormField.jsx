import Input from '../atoms/Input';
import Label from '../atoms/Label';

export default function FormField({ label, error, required = false, className = '', ...props }) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && <Label required={required}>{label}</Label>}
      <Input error={error} {...props} />
    </div>
  );
}
