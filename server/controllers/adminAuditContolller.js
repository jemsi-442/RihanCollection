import AuditLog from "../models/AuditLog.js";

export const getAuditLogs = async (req, res) => {
  const { status, rider, date } = req.query;

  const query = {};

  if (status) query.action = status;
  if (rider) query.riderId = rider;

  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    query.createdAt = { $gte: start, $lte: end };
  }

  const logs = await AuditLog.find(query)
    .sort({ createdAt: -1 })
    .limit(200);

  res.json(logs);
};
