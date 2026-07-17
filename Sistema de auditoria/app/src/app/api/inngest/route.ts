import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { certificateAlerts } from "@/inngest/functions/certificate-alerts";
import { contractAlerts } from "@/inngest/functions/contract-alerts";
import {
  checkOverdueReports,
  remindAuditClose,
  remindAuditPlan,
} from "@/inngest/functions/audit-reminders";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    certificateAlerts,
    contractAlerts,
    remindAuditPlan,
    remindAuditClose,
    checkOverdueReports,
  ],
});
