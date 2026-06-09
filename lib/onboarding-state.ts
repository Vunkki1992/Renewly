export type PlanIntent = "free" | "monthly" | "lifetime";

let _planIntent: PlanIntent = "free";

export const getPlanIntent = (): PlanIntent => _planIntent;
export const setPlanIntent = (p: PlanIntent): void => { _planIntent = p; };
