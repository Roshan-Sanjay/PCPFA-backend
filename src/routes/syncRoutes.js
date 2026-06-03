import express from 'express';
import { sync } from '../controllers/syncController.js';

const router = express.Router();

router.post('/', sync);

export default router;
