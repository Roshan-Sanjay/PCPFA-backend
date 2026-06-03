export const validateRecord = (record) => {
  return Boolean(
    record &&
    typeof record === 'object' &&
    !Array.isArray(record) &&
    Object.keys(record).length > 0
  );
};

export const getRecordSourceId = (record, fallback) => {
  return String(
    record.id ||
    record._id ||
    record.studentId ||
    record.companyId ||
    record.driveId ||
    record.applicationId ||
    record.interviewId ||
    fallback
  );
};
