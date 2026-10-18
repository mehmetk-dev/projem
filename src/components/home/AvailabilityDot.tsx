import { AVAILABILITY_OPTIONS, type AvailabilityStatus } from '@/lib/availability';

// Müsaitlik rengi; yalnızca "açık" durumunda nabız gibi atar
export default function AvailabilityDot({ status }: { status: AvailabilityStatus }) {
  const color = AVAILABILITY_OPTIONS[status].dot;
  return (
    <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
      {status === 'open' && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${color}`} />}
      <span className={`relative inline-flex h-2 w-2 rounded-full ${color}`} />
    </span>
  );
}
