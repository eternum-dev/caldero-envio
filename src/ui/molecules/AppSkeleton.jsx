import Skeleton from '../atoms/Skeleton';

/**
 * AppSkeleton — loading placeholder that mirrors the App calculator layout.
 * Shows skeletons for SearchBox, CourierSelect, Button, and MapPreview.
 */
export default function AppSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:min-h-[calc(100vh-104px)]">
      {/* Left panel */}
      <div className="lg:border-r lg:pr-7 pb-7 lg:pb-0 border-b lg:border-b-0 border-gold/18 grid grid-cols-1 gap-10 content-start">
        <Skeleton variant="text" className="h-9 w-48" />

        <div className="flex flex-col gap-4">
          <div>
            <Skeleton variant="text" className="h-3 w-32 mb-1.5" />
            <Skeleton variant="rect" className="h-11 w-full" />
          </div>

          <div>
            <Skeleton variant="text" className="h-3 w-28 mb-1.5" />
            <Skeleton variant="rect" className="h-11 w-full" />
          </div>

          <Skeleton variant="rect" className="h-12 w-44" />
        </div>

        {/* Results skeleton */}
        <div className="flex flex-col gap-4">
          <Skeleton variant="rect" className="h-24 w-full" />
          <Skeleton variant="rect" className="h-20 w-full" />
          <div className="flex gap-3">
            <Skeleton variant="rect" className="h-11 w-36" />
            <Skeleton variant="rect" className="h-11 w-36" />
            <Skeleton variant="rect" className="h-11 w-36" />
          </div>
        </div>
      </div>

      {/* Right panel — map */}
      <div className="lg:flex lg:flex-col pl-0 lg:pl-7 pt-7 lg:pt-0 pb-4">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton variant="text" className="h-7 w-16" />
          <Skeleton variant="rect" className="h-5 w-24 rounded-full" />
        </div>
        <Skeleton variant="rect" className="w-full flex-1 min-h-[300px]" />
      </div>
    </div>
  );
}
