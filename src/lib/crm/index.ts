import type { CrmAdapter } from "@/lib/crm/types";
import { WealthboxAdapter } from "@/lib/crm/wealthbox/adapter";
import { RedtailAdapter } from "@/lib/crm/redtail/adapter";
import { OrionAdapter } from "@/lib/crm/orion/adapter";

export type CrmVendor = "wealthbox" | "redtail" | "orion";

export function getCrmAdapter(vendor: CrmVendor, advisorId: string): CrmAdapter {
  switch (vendor) {
    case "wealthbox":
      return new WealthboxAdapter(advisorId);
    case "redtail":
      return new RedtailAdapter(advisorId);
    case "orion":
      return new OrionAdapter(advisorId);
    default: {
      const _exhaustive: never = vendor;
      throw new Error(`Unknown CRM vendor: ${String(_exhaustive)}`);
    }
  }
}
