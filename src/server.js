import app from './app.js';
import { connectDB } from './config/db.js';
import { fetchAssessmentDataset } from './utils/datasetApi.js';

const PORT = process.env.PORT || 5000;

const loadData = async () => {
  try {
    app.locals.dataset = await fetchAssessmentDataset();
    console.log('Dataset loaded:', Object.keys(app.locals.dataset));
  } catch (error) {
    console.log('Dataset fetch error:', error.response?.data || error.message);
  }
};

const startServer = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || '';

    if (mongoURI && !mongoURI.includes('<username>')) {
      await connectDB();
    } else {
      console.log('MongoDB not connected: MONGO_URI is missing or still has placeholder values.');
    }

    await loadData();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Server failed to start: ${error.message}`);
    process.exit(1);
  }
};

startServer();
