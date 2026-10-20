import "server-only";

export type InsightSeverity = "info" | "watch" | "action";

export interface DeterministicInsight {
  id: string;
  severity: InsightSeverity;
  title: string;
  detail: string;
  metric: string;
}

export interface BackendInsightsData {
  generatedAt: string;
  requests: {
    last14Days: number;
    previous14Days: number;
    changePct: number;
    completionRate: number;
    cancellationRate: number;
  };
  revenue: {
    last14Days: string;
    previous14Days: string;
  };
  rating: {
    last14Days: number | null;
    previous14Days: number | null;
  };
  dailyRequests: Array<{
    date: string;
    count: number;
  }>;
  anomalies: Array<{
    date: string;
    count: number;
    zScore: number;
  }>;
  stuck: {
    assignedOver24h: { count: number; oldestAt: string | null };
    openOver24h: { count: number; oldestAt: string | null };
    inProgressOver48h: { count: number; oldestAt: string | null };
  };
  unpaidInvoices: {
    count: number;
    totalAmount: string;
  };
  mechanics: {
    available: number;
    busy: number;
    offline: number;
    topByCompleted30d: Array<{ name: string; completed: number }>;
    lowRated: Array<{ name: string; averageRating: number; reviewCount: number }>;
  };
  openByPriority: {
    LOW: number;
    NORMAL: number;
    HIGH: number;
    EMERGENCY: number;
  };
  lowStockItems: number;
}

/**
 * Builds deterministic insights strictly based on metrics thresholds.
 * An insight is only added when its numbers warrant it.
 */
export function buildDeterministicInsights(
  data: BackendInsightsData
): DeterministicInsight[] {
  const list: DeterministicInsight[] = [];

  // 1. Stuck Requests: assigned over 24h, open over 24h, in progress over 48h
  const assignedStuck = data.stuck.assignedOver24h.count;
  const openStuck = data.stuck.openOver24h.count;
  const inProgressStuck = data.stuck.inProgressOver48h.count;
  const totalStuck = assignedStuck + openStuck + inProgressStuck;

  if (totalStuck > 0) {
    const details: string[] = [];
    if (assignedStuck > 0) details.push(`${assignedStuck} assigned >24h`);
    if (openStuck > 0) details.push(`${openStuck} pending/searching >24h`);
    if (inProgressStuck > 0) details.push(`${inProgressStuck} in progress >48h`);

    list.push({
      id: "stuck-requests",
      severity: totalStuck >= 3 ? "action" : "watch",
      title: "Stuck Service Requests Detected",
      detail: `There are ${totalStuck} requests exceeding operational delay thresholds: ${details.join(
        ", "
      )}. Immediate dispatcher review recommended.`,
      metric: `${totalStuck} stuck`,
    });
  }

  // 2. Open EMERGENCY and HIGH Requests
  const emergencyCount = data.openByPriority?.EMERGENCY ?? 0;
  const highCount = data.openByPriority?.HIGH ?? 0;

  if (emergencyCount > 0) {
    list.push({
      id: "open-emergency",
      severity: "action",
      title: "Active Emergency Requests",
      detail: `${emergencyCount} emergency roadside request(s) currently open and require urgent dispatch allocation.`,
      metric: `${emergencyCount} emergency`,
    });
  } else if (highCount > 0) {
    list.push({
      id: "open-high",
      severity: "watch",
      title: "Active High-Priority Requests",
      detail: `${highCount} high-priority roadside request(s) open awaiting prompt mechanic assignment.`,
      metric: `${highCount} high priority`,
    });
  }

  // 3. Unpaid Invoices for completed jobs
  const unpaidCount = data.unpaidInvoices.count;
  const unpaidAmount = Number(data.unpaidInvoices.totalAmount);
  if (unpaidCount > 0) {
    list.push({
      id: "unpaid-invoices",
      severity: unpaidAmount >= 5000 || unpaidCount >= 5 ? "action" : "watch",
      title: "Unpaid Completed Invoices",
      detail: `${unpaidCount} invoice(s) for completed service jobs remain unpaid, totaling ${unpaidAmount.toFixed(
        2
      )} BDT.`,
      metric: `${unpaidAmount.toFixed(2)} BDT (${unpaidCount})`,
    });
  }

  // 4. Request Volume versus previous 14 days
  const reqLast14 = data.requests.last14Days;
  const reqPrev14 = data.requests.previous14Days;
  const changePct = data.requests.changePct;

  if (reqLast14 > 0 || reqPrev14 > 0) {
    const isDecline = changePct < -20;
    const isSurge = changePct > 30;
    list.push({
      id: "request-volume-trend",
      severity: isDecline ? "watch" : isSurge ? "info" : "info",
      title: isDecline ? "Request Volume Downturn" : isSurge ? "Request Volume Growth Surge" : "14-Day Request Volume Stability",
      detail: `Recorded ${reqLast14} requests in the last 14 days compared to ${reqPrev14} in the previous period (${changePct >= 0 ? "+" : ""}${changePct}%).`,
      metric: `${changePct >= 0 ? "+" : ""}${changePct}%`,
    });
  }

  // 5. Completion & Cancellation Rates
  const compRate = Math.round(data.requests.completionRate * 100);
  const cancRate = Math.round(data.requests.cancellationRate * 100);

  if (cancRate >= 20) {
    list.push({
      id: "high-cancellation-rate",
      severity: "action",
      title: "Elevated Cancellation Rate",
      detail: `Cancellation rate reached ${cancRate}% over the last 14 days. Investigate mechanic response times and price estimation disputes.`,
      metric: `${cancRate}% cancelled`,
    });
  } else if (compRate > 0) {
    list.push({
      id: "completion-health",
      severity: compRate < 60 ? "watch" : "info",
      title: "Service Completion Ratio",
      detail: `Completion rate is currently ${compRate}% (${cancRate}% cancellation).`,
      metric: `${compRate}% completed`,
    });
  }

  // 6. Anomaly Days (Z-Score >= 2)
  if (data.anomalies && data.anomalies.length > 0) {
    for (const anom of data.anomalies) {
      list.push({
        id: `anomaly-${anom.date}`,
        severity: "watch",
        title: `Spike Anomaly on ${anom.date}`,
        detail: `Unusually high volume of ${anom.count} requests recorded on ${anom.date} with a statistical z-score of ${anom.zScore}.`,
        metric: `z=${anom.zScore} (${anom.count} reqs)`,
      });
    }
  }

  // 7. Mechanic Availability & Capacity
  const avail = data.mechanics.available;
  const busy = data.mechanics.busy;
  const offline = data.mechanics.offline;
  const totalMechanics = avail + busy + offline;

  if (totalMechanics > 0 && avail === 0 && (emergencyCount > 0 || highCount > 0)) {
    list.push({
      id: "zero-available-mechanics",
      severity: "action",
      title: "Zero Mechanics Available",
      detail: `No mechanics are currently in AVAILABLE status while urgent requests are waiting (${busy} busy, ${offline} offline).`,
      metric: "0 available",
    });
  } else if (totalMechanics > 0 && avail < totalMechanics * 0.15) {
    list.push({
      id: "low-mechanic-capacity",
      severity: "watch",
      title: "Low Available Fleet Capacity",
      detail: `Only ${avail} out of ${totalMechanics} registered mechanics are currently available for instant dispatch.`,
      metric: `${avail}/${totalMechanics} online`,
    });
  }

  // 8. Low-rated Mechanics (rating < 3.5 with >= 3 reviews)
  const lowRatedCount = data.mechanics.lowRated.length;
  if (lowRatedCount > 0) {
    list.push({
      id: "low-rated-mechanics",
      severity: "watch",
      title: "Mechanics Requiring Quality Review",
      detail: `${lowRatedCount} mechanic(s) hold an average customer rating below 3.5 stars (minimum 3 completed reviews).`,
      metric: `${lowRatedCount} mechanics`,
    });
  }

  // 9. Low Stock Inventory Items
  if (data.lowStockItems > 0) {
    list.push({
      id: "low-stock-spare-parts",
      severity: data.lowStockItems >= 5 ? "action" : "watch",
      title: "Spare Parts Low Stock Alert",
      detail: `${data.lowStockItems} inventory item(s) are at or below safety stock threshold (≤ 2 units).`,
      metric: `${data.lowStockItems} parts low`,
    });
  }

  return list;
}
