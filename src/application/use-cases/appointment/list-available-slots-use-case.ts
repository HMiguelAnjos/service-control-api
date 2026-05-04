import { IAppointmentRepository } from '../../ports/iappointment-repository';
import { IAvailabilityRepository } from '../../ports/iavailability-repository';
import { IBlockedTimeRepository } from '../../ports/iblocked-time-repository';

export interface AvailableSlot {
  start: Date;
  end: Date;
}

export interface ListAvailableSlotsInput {
  userId: number;
  /** Date (any time-of-day, the use case considers the whole day). */
  date: Date;
  /** Slot duration in minutes. */
  durationMinutes: number;
  /** Slot step in minutes (e.g. 30 = slot every half hour). Defaults to durationMinutes. */
  stepMinutes?: number;
}

const MS_PER_MINUTE = 60 * 1000;

/**
 * Returns the list of free slots in the given day.  A slot is "free" when:
 *   1. It falls inside an active availability rule for that day-of-week.
 *   2. No appointment overlaps it (canceled / no_show ignored).
 *   3. No blocked-time entry overlaps it.
 */
export class ListAvailableSlotsUseCase {
  constructor(
    private appointments: IAppointmentRepository,
    private availability: IAvailabilityRepository,
    private blocked: IBlockedTimeRepository,
  ) {}

  async execute(input: ListAvailableSlotsInput): Promise<AvailableSlot[]> {
    const dayStart = startOfDay(input.date);
    const dayEnd = endOfDay(input.date);

    const rules = await this.availability.listByUser(input.userId);
    const dayRules = rules.filter(r => r.isActive && r.dayOfWeek === input.date.getDay());
    if (dayRules.length === 0) return [];

    const [appts, blocks] = await Promise.all([
      this.appointments.list({ userId: input.userId, from: dayStart, to: dayEnd }),
      this.blocked.list(input.userId, dayStart, dayEnd),
    ]);

    const busyRanges: Array<{ start: number; end: number }> = [
      ...appts
        .filter(a => a.status !== 'canceled' && a.status !== 'no_show')
        .map(a => ({ start: a.startTime.getTime(), end: a.endTime.getTime() })),
      ...blocks.map(b => ({ start: b.startTime.getTime(), end: b.endTime.getTime() })),
    ];

    const step = (input.stepMinutes ?? input.durationMinutes) * MS_PER_MINUTE;
    const duration = input.durationMinutes * MS_PER_MINUTE;

    const slots: AvailableSlot[] = [];
    for (const rule of dayRules) {
      const ruleStart = dayStart.getTime() + rule.startMinutes * MS_PER_MINUTE;
      const ruleEnd = dayStart.getTime() + rule.endMinutes * MS_PER_MINUTE;

      for (let t = ruleStart; t + duration <= ruleEnd; t += step) {
        const slotEnd = t + duration;
        const overlaps = busyRanges.some(b => b.start < slotEnd && b.end > t);
        if (!overlaps) {
          slots.push({ start: new Date(t), end: new Date(slotEnd) });
        }
      }
    }
    return slots;
  }
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
