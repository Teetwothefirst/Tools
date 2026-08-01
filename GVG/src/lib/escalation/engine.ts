import { Beneficiary, CheckIn, Escalation } from '../../types/gvg';

export interface EscalationCheckResult {
  shouldEscalate: boolean;
  reason: string;
  triggeredBy: string;
}

export function evaluateEscalationRules(
  beneficiary: Beneficiary,
  checkInsForBeneficiary: CheckIn[],
  latestCheckIn?: CheckIn
): EscalationCheckResult {
  // Rule 1: Machine not in use (Immediate flag)
  if (latestCheckIn && !latestCheckIn.machine_in_use) {
    return {
      shouldEscalate: true,
      reason: 'Asset Non-Usage: Grinding/Sewing machine reported idle or not in use.',
      triggeredBy: latestCheckIn.id,
    };
  }

  // Rule 2: Agent manually checked needs_assistance: true
  if (latestCheckIn && latestCheckIn.needs_assistance) {
    return {
      shouldEscalate: true,
      reason: `Field Agent Assistance Flag: ${latestCheckIn.notes || 'Field agent requested admin intervention.'}`,
      triggeredBy: latestCheckIn.id,
    };
  }

  // Rule 3: Two consecutive check-ins report business_active: false
  const sortedCheckins = [...checkInsForBeneficiary].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  if (sortedCheckins.length >= 2) {
    const recent2 = sortedCheckins.slice(0, 2);
    if (recent2.every((c) => !c.business_active)) {
      return {
        shouldEscalate: true,
        reason: 'Business Failure Signal: Two consecutive field visits confirmed business inactive.',
        triggeredBy: recent2[0].id,
      };
    }
  }

  // Rule 4: Beneficiary unreachable for 2+ scheduled check-in cycles
  if (beneficiary.missed_checkins_count >= 2 || beneficiary.status === 'unreachable') {
    return {
      shouldEscalate: true,
      reason: `Unreachable Beneficiary: Unreachable for ${beneficiary.missed_checkins_count || 2} consecutive check-in cycles.`,
      triggeredBy: 'system_missed',
    };
  }

  return {
    shouldEscalate: false,
    reason: '',
    triggeredBy: '',
  };
}
