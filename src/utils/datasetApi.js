import axios from 'axios';

const getTokenBody = () => {
  const body = {
    studentId: process.env.EXTERNAL_STUDENT_ID,
    password: process.env.EXTERNAL_STUDENT_PASSWORD
  };

  if (process.env.EXTERNAL_DATASET_SET) {
    body.set = process.env.EXTERNAL_DATASET_SET;
  }

  return body;
};

export const fetchAssessmentDataset = async () => {
  const baseURL = process.env.EXTERNAL_API_BASE_URL || 'https://t4e-testserver.onrender.com/api';

  const tokenResponse = await axios.post(`${baseURL}/public/token`, getTokenBody(), {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const { token, dataUrl } = tokenResponse.data;

  const datasetResponse = await axios.get(`${baseURL}${dataUrl || '/private/data'}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return datasetResponse.data.data || datasetResponse.data;
};
