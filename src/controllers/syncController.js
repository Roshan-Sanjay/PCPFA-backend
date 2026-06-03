import { syncDataset } from '../services/syncService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const sync = asyncHandler(async (_req, res) => {
  const summary = await syncDataset();
  return res.json(summary);
});
