import Company from "../models/Company.js";
import Drive from "../models/Drive.js";
import { ApiError } from "../utils/errors.js";

const normalizeCompanyInput = (payload) => {
  const data = { ...payload };

  if (data.id && !data.companyId) {
    data.companyId = data.id;
  }

  if (Array.isArray(data.eligibleDepartments)) {
    data.eligibleDepartments = data.eligibleDepartments.map((department) =>
      String(department).trim().toUpperCase(),
    );
  }

  return data;
};

export const createCompany = async (payload) => {
  const data = normalizeCompanyInput(payload);

  const existingCompany = await Company.findOne({ companyId: data.companyId });
  if (existingCompany) {
    throw new ApiError("Company already exists", 409);
  }

  return Company.create(data);
};

export const getCompanies = async (query) => {
  const filter = {};
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit) || 10)); // Cap at 100
  const skip = (page - 1) * limit;

  // Status filter
  if (query.status) {
    filter.status = query.status;
  }

  // Department filter
  if (query.department) {
    filter.eligibleDepartments = query.department.toUpperCase();
  }

  // Company name filter
  if (query.company) {
    filter.name = { $regex: query.company, $options: "i" };
  }

  // Search by name or company ID
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { companyId: { $regex: query.search, $options: "i" } },
    ];
  }

  // Get total count for pagination metadata
  const total = await Company.countDocuments(filter);

  // Fetch paginated results
  const companies = await Company.find(filter)
    .sort({ driveDate: 1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    companies,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getCompanyById = async (id) => {
  const company = await Company.findOne({
    $or: [
      { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : undefined },
      { companyId: id },
    ].filter((condition) => Object.values(condition)[0]),
  });

  if (!company) {
    throw new ApiError("Company not found", 404);
  }

  return company;
};

export const updateCompany = async (id, payload) => {
  const company = await getCompanyById(id);
  const data = normalizeCompanyInput(payload);

  delete data.companyId;
  delete data.id;

  Object.assign(company, data);
  return company.save();
};

export const deleteCompany = async (id) => {
  const company = await getCompanyById(id);
  const linkedDriveCount = await Drive.countDocuments({ company: company._id });

  if (linkedDriveCount > 0) {
    throw new ApiError("Cannot delete company with linked drives", 409);
  }

  await company.deleteOne();
  return company;
};
