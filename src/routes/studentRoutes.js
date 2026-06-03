import express from 'express';
import { getStudent, listStudents } from '../controllers/studentController.js';

const router = express.Router();

router.get('/', listStudents);
router.get('/:id', getStudent);

export default router;
