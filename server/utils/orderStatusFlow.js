export const ORDER_STATUS_FLOW = {
  pending: ["paid", "cancelled"],
  paid: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["accepted", "reassigned"],
  accepted: ["delivered", "refunded"],
  delivered: [],
  cancelled: [],
  refunded: [],
};


export const canTransition = (current, next) => {
  return ORDER_STATUS_FLOW[current]?.includes(next);
};
