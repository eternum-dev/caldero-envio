import Skeleton from '../atoms/Skeleton';

/**
 * SettingsSkeleton — loading placeholder for Settings tabs.
 * Shows skeleton fields for Store, Couriers, and Pricing cards.
 */
export default function SettingsSkeleton() {
  return (
    <div className="bg-surface border border-gold/18 rounded-[14px] p-5">
      <Skeleton variant="text" className="h-7 w-40 mb-6" />

      <div className="flex flex-col gap-4">
        {/* Store fields: name, phone */}
        <div>
          <Skeleton variant="text" className="h-3 w-28 mb-1.5" />
          <Skeleton variant="rect" className="h-11 w-full" />
        </div>
        <div>
          <Skeleton variant="text" className="h-3 w-20 mb-1.5" />
          <Skeleton variant="rect" className="h-11 w-full" />
        </div>

        {/* Country + City row */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Skeleton variant="text" className="h-3 w-16 mb-1.5" />
            <Skeleton variant="rect" className="h-11 w-full" />
          </div>
          <div className="flex-1">
            <Skeleton variant="text" className="h-3 w-16 mb-1.5" />
            <Skeleton variant="rect" className="h-11 w-full" />
          </div>
        </div>

        {/* Address */}
        <div>
          <Skeleton variant="text" className="h-3 w-24 mb-1.5" />
          <Skeleton variant="rect" className="h-11 w-full" />
        </div>

        {/* Map preview */}
        <Skeleton variant="rect" className="w-full h-48" />

        {/* Save button */}
        <Skeleton variant="rect" className="h-9 w-36" />
      </div>
    </div>
  );
}
