import Skeleton from '../atoms/Skeleton';

/**
 * OnboardingSkeleton — loading placeholder that mirrors the Onboarding step 1 layout.
 * Shows step indicator, skeleton fields for store setup.
 */
export default function OnboardingSkeleton() {
  return (
    <div>
      {/* Step indicators skeleton */}
      <div className="flex justify-center gap-3 mb-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton variant="circle" className="w-8 h-8" />
            <Skeleton variant="text" className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Form card skeleton */}
      <div className="bg-surface border border-gold/18 rounded-[14px] p-6">
        <Skeleton variant="text" className="h-7 w-40 mb-6" />

        <div className="flex flex-col gap-4">
          {/* Name */}
          <div>
            <Skeleton variant="text" className="h-3 w-28 mb-1.5" />
            <Skeleton variant="rect" className="h-11 w-full" />
          </div>

          {/* Phone */}
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

          {/* Navigation buttons */}
          <div className="flex justify-between pt-4">
            <Skeleton variant="rect" className="h-11 w-24" />
            <Skeleton variant="rect" className="h-11 w-28" />
          </div>
        </div>
      </div>
    </div>
  );
}
