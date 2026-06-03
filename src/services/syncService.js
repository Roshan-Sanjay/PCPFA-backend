import Application from '../models/Application.js';
import Company from '../models/Company.js';
import Drive from '../models/Drive.js';
import Interview from '../models/Interview.js';
import Student from '../models/Student.js';
import { fetchAssessmentDataset } from '../utils/datasetApi.js';
import { validateRecord } from '../utils/validator.js';

const collectionNames = ['students', 'companies', 'drives', 'applications', 'interviews'];

const createCollectionSummary = (records) => ({
  totalFetched: Array.isArray(records) ? records.length : 0,
  inserted: 0,
  duplicates: 0,
  rejected: 0
});

const countResult = (summary, collection, result) => {
  if (result.upsertedCount > 0) {
    summary.inserted += 1;
    summary.collections[collection].inserted += 1;
  } else {
    summary.duplicates += 1;
    summary.collections[collection].duplicates += 1;
  }
};

const rejectRecord = (summary, collection) => {
  summary.rejected += 1;
  summary.collections[collection].rejected += 1;
};

const normalizeDepartments = (departments) => {
  if (!Array.isArray(departments)) return [];
  return departments.map((department) => String(department).trim().toUpperCase());
};

const syncStudents = async (records, summary) => {
  for (const record of records) {
    if (!validateRecord(record)) {
      rejectRecord(summary, 'students');
      continue;
    }

    try {
      const result = await Student.updateOne(
        { studentId: record.studentId },
        {
          $setOnInsert: {
            studentId: record.studentId,
            name: record.name,
            email: record.email,
            department: record.department,
            cgpa: record.cgpa,
            skills: Array.isArray(record.skills) ? record.skills : [],
            graduationYear: record.graduationYear,
            phone: record.phone,
            status: record.status || 'active'
          }
        },
        { upsert: true, runValidators: true }
      );

      countResult(summary, 'students', result);
    } catch (_error) {
      rejectRecord(summary, 'students');
    }
  }
};

const syncCompanies = async (records, summary) => {
  for (const record of records) {
    if (!validateRecord(record)) {
      rejectRecord(summary, 'companies');
      continue;
    }

    try {
      const result = await Company.updateOne(
        { companyId: record.companyId },
        {
          $setOnInsert: {
            companyId: record.companyId,
            name: record.name,
            role: record.role,
            package: record.package,
            eligibleDepartments: normalizeDepartments(record.eligibleDepartments),
            minimumCgpa: record.minimumCgpa,
            driveDate: record.driveDate,
            status: record.status || 'upcoming'
          }
        },
        { upsert: true, runValidators: true }
      );

      countResult(summary, 'companies', result);
    } catch (_error) {
      rejectRecord(summary, 'companies');
    }
  }
};

const syncDrives = async (records, summary) => {
  for (const record of records) {
    if (!validateRecord(record)) {
      rejectRecord(summary, 'drives');
      continue;
    }

    try {
      const company = await Company.findOne({ companyId: record.companyId });
      if (!company) {
        rejectRecord(summary, 'drives');
        continue;
      }

      const result = await Drive.updateOne(
        { driveId: record.driveId },
        {
          $setOnInsert: {
            driveId: record.driveId,
            company: company._id,
            companyId: record.companyId,
            title: record.title,
            mode: record.mode,
            location: record.location,
            registrationDeadline: record.registrationDeadline,
            rounds: Array.isArray(record.rounds) ? record.rounds : [],
            status: record.status || 'open'
          }
        },
        { upsert: true, runValidators: true }
      );

      countResult(summary, 'drives', result);
    } catch (_error) {
      rejectRecord(summary, 'drives');
    }
  }
};

const syncApplications = async (records, summary) => {
  for (const record of records) {
    if (!validateRecord(record)) {
      rejectRecord(summary, 'applications');
      continue;
    }

    try {
      const [student, drive] = await Promise.all([
        Student.findOne({ studentId: record.studentId }),
        Drive.findOne({ driveId: record.driveId })
      ]);

      if (!student || !drive) {
        rejectRecord(summary, 'applications');
        continue;
      }

      const result = await Application.updateOne(
        { applicationId: record.applicationId },
        {
          $setOnInsert: {
            applicationId: record.applicationId,
            student: student._id,
            studentId: record.studentId,
            drive: drive._id,
            driveId: record.driveId,
            appliedAt: record.appliedAt,
            currentRound: record.currentRound,
            status: record.status || 'applied'
          }
        },
        { upsert: true, runValidators: true }
      );

      countResult(summary, 'applications', result);
    } catch (_error) {
      rejectRecord(summary, 'applications');
    }
  }
};

const syncInterviews = async (records, summary) => {
  for (const record of records) {
    if (!validateRecord(record)) {
      rejectRecord(summary, 'interviews');
      continue;
    }

    try {
      const application = await Application.findOne({ applicationId: record.applicationId });
      if (!application) {
        rejectRecord(summary, 'interviews');
        continue;
      }

      const result = await Interview.updateOne(
        { interviewId: record.interviewId },
        {
          $setOnInsert: {
            interviewId: record.interviewId,
            application: application._id,
            applicationId: record.applicationId,
            interviewer: record.interviewer,
            round: record.round,
            scheduledAt: record.scheduledAt || record.interviewDate,
            result: record.result || 'pending'
          }
        },
        { upsert: true, runValidators: true }
      );

      countResult(summary, 'interviews', result);
    } catch (_error) {
      rejectRecord(summary, 'interviews');
    }
  }
};

export const syncDataset = async () => {
  const dataset = await fetchAssessmentDataset();
  const summary = {
    success: true,
    totalFetched: 0,
    inserted: 0,
    duplicates: 0,
    rejected: 0,
    collections: {}
  };

  for (const name of collectionNames) {
    const records = Array.isArray(dataset[name]) ? dataset[name] : [];
    summary.collections[name] = createCollectionSummary(records);
    summary.totalFetched += records.length;
  }

  await syncStudents(summary.collections.students.totalFetched ? dataset.students : [], summary);
  await syncCompanies(summary.collections.companies.totalFetched ? dataset.companies : [], summary);
  await syncDrives(summary.collections.drives.totalFetched ? dataset.drives : [], summary);
  await syncApplications(summary.collections.applications.totalFetched ? dataset.applications : [], summary);
  await syncInterviews(summary.collections.interviews.totalFetched ? dataset.interviews : [], summary);

  return summary;
};
