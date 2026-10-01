export type InventoryAccountingImpactLine = {
  accountKey: string;
  debitOrCredit: "debit" | "credit";
  amount: number;
  currency: string;
  branchScope?: string;
  memo?: string;
};

export type InventoryAccountingPlanRequest = {
  companyId: number;
  sourceMovementId: string;
  sourceReference: string;
  impactType: string;
  effectiveDate: string;
  correlationId: string;
  lines: InventoryAccountingImpactLine[];
};

export type InventoryAccountingPlanResponse = {
  planId: string;
  status: string;
  lines: InventoryAccountingImpactLine[];
  accountingContractVersion: string;
};

export function assertAccountingPlanRequest(request: InventoryAccountingPlanRequest): void {
  if (!Number.isInteger(request.companyId) || request.companyId <= 0) throw new Error("companyId must be a positive integer");
  for (const [name, value] of Object.entries({
    sourceMovementId: request.sourceMovementId,
    sourceReference: request.sourceReference,
    impactType: request.impactType,
    effectiveDate: request.effectiveDate,
    correlationId: request.correlationId,
  })) if (!value?.trim()) throw new Error(`${name} is required`);
  if (!request.lines.length) throw new Error("lines are required");
  for (const line of request.lines) {
    if (!line.accountKey.trim() || !line.currency.trim()) throw new Error("Accounting line identity is required");
    if (!Number.isFinite(line.amount) || line.amount <= 0) throw new Error("Accounting line amount must be positive and finite");
    if (line.debitOrCredit !== "debit" && line.debitOrCredit !== "credit") throw new Error("Accounting line side is invalid");
  }
}
