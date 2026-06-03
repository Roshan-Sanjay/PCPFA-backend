import Drive from "../models/Drive.js";
import Company from "../models/Company.js";
import { ApiError } from "../utils/errors.js";

/**
 * Get drives with filtering and pagination
 * Query parameters:
 * - status: filter by status (open, closed, cancelled, completed)
 * - company: filter by company name
 * - companyId: filter by company ID
 * - page: pagination page number (default: 1)
 * - limit: items per page (default: 10)
 * - search: search by title or company name
 */
export const getDrives = async (query) => {
  const filter = {};
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit) || 10)); // Cap at 100
  const skip = (page - 1) * limit;

  // Status filter
  if (query.status) {
    filter.status = query.status;
  }

  // Company name filter
  if (query.company) {
    // First find companies matching the name
    const companies = await Company.find({
      name: { $regex: query.company, $options: "i" },
    }).select("_id");

    if (companies.length > 0) {
      filter.company = { $in: companies.map((c) => c._id) };
    } else {
      // No companies found, return empty results
      return {
        drives: [],
        pagination: {
          total: 0,
          page,
          limit,
          pages: 0,
        },
      };
    }
  }

  // Company ID filter
  if (query.companyId) {
    const company = await Company.findOne({ companyId: query.companyId });
    if (company) {
      filter.company = company._id;
    } else {
      // Company not found
      return {
        drives: [],
        pagination: {
          total: 0,
          page,
          limit,
          pages: 0,
        },
      };
    }
  }

  // Search by title, company name, or drive ID
  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: "i" } },
      { driveId: { $regex: query.search, $options: "i" } },
    ];
  }

  // Get total count for pagination metadata
  const total = await Drive.countDocuments(filter);

  // Fetch paginated results
  const drives = await Drive.find(filter)
    .populate("company", "name companyId")
    .sort({ registrationDeadline: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    drives,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get drive by ID
 */
export const getDriveById = async (id) => {
  const drive = await Drive.findOne({
    $or: [
      { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : undefined },
      { driveId: id },
    ].filter((condition) => Object.values(condition)[0]),
  }).populate("company");

  if (!drive) {
    throw new ApiError("Drive not found", 404);
  }

  return drive;
};

/**
 * Create a new drive
 */
export const createDrive = async (driveData) => {
  const { companyId, ...otherData } = driveData;

  // Validate company exists
  const company = await Company.findOne({ companyId });
  if (!company) {
    throw new ApiError("Company not found", 404);
  }

  // Generate drive ID if not provided
  const driveId =
    driveData.driveId ||
    `DRV-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

  const drive = await Drive.create({
    ...otherData,
    driveId,
    company: company._id,
    companyId,
  });

  return drive.populate("company");
};

/**
 * Update drive
 */
export const updateDrive = async (id, updateData) => {
  const drive = await getDriveById(id);

  if (updateData.companyId) {
    const company = await Company.findOne({ companyId: updateData.companyId });
    if (!company) {
      throw new ApiError("Company not found", 404);
    }
    updateData.company = company._id;
  }

  Object.assign(drive, updateData);
  await drive.save();
  return drive.populate("company");
};

/**
 * Delete drive
 */
export const deleteDrive = async (id) => {
  const drive = await Drive.findByIdAndDelete(
    id.match(/^[0-9a-fA-F]{24}$/) ? id : (await getDriveById(id))._id,
  );

  if (!drive) {
    throw new ApiError("Drive not found", 404);
  }

  return drive;
};

/**
 * Get drives by company
 */
export const getDrivesByCompany = async (companyId) => {
  const company = await Company.findOne({ companyId });
  if (!company) {
    throw new ApiError("Company not found", 404);
  }

  const drives = await Drive.find({ company: company._id })
    .populate("company")
    .sort({ registrationDeadline: -1 })
    .lean();

  return drives;
};
