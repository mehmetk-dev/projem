// Sitede "yeni projelere açığım" rozetinin durumu; panelde Ayarlar > Müsaitlik'ten yönetilir.
// Değerler site_settings tablosunda tutulur.

export const AVAILABILITY_KEYS = { status: 'availabilityStatus', note: 'availabilityNote', booking: 'bookingUrl' } as const;

export type AvailabilityStatus = 'open' | 'limited' | 'closed';

export interface Availability {
  status: AvailabilityStatus;
  note: string;
  /** Tanışma görüşmesi planlama linki (Cal.com, Calendly…); yoksa null */
  bookingUrl: string | null;
}

export const AVAILABILITY_OPTIONS: Record<AvailabilityStatus, { label: string; defaultNote: string; dot: string }> = {
  open: { label: 'Açık', defaultNote: 'Yeni projelere açığım', dot: 'bg-emerald-500' },
  limited: { label: 'Sınırlı', defaultNote: 'Sınırlı sayıda yer var', dot: 'bg-amber-500' },
  closed: { label: 'Kapalı', defaultNote: 'Şu an yeni proje almıyorum', dot: 'bg-stone-400' },
};

export function parseAvailability(
  status: string | null | undefined,
  note: string | null | undefined,
  booking?: string | null
): Availability {
  const safeStatus: AvailabilityStatus = status === 'limited' || status === 'closed' ? status : 'open';
  const bookingUrl = booking?.trim().startsWith('https://') ? booking.trim() : null;
  return { status: safeStatus, note: note?.trim() || AVAILABILITY_OPTIONS[safeStatus].defaultNote, bookingUrl };
}
