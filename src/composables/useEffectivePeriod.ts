import { type PeriodDto } from '@/api/generated';

export const isPeriodOngoing = (period: PeriodDto | undefined): boolean => {
  if (!period?.endDate)
    return false;
  return new Date(period.endDate).getTime() > Date.now();
};

// Local datetime string ("YYYY-MM-DDTHH:mm:ss") matching the format used for period dates.
const nowAsPeriodDate = (): string => {
  return new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 19);
};

// The period's actual end date, or now if the period is still ongoing.
export const effectiveEndDate = (period: PeriodDto | undefined): string | undefined => {
  if (!period)
    return undefined;
  return isPeriodOngoing(period) ? nowAsPeriodDate() : period.endDate;
};
