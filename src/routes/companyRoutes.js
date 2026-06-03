import express from 'express';
import {
  addCompany,
  getCompany,
  listCompanies,
  patchCompany,
  removeCompany
} from '../controllers/companyController.js';

const router = express.Router();

router.post('/', addCompany);
router.get('/', listCompanies);
router.get('/:id', getCompany);
router.patch('/:id', patchCompany);
router.delete('/:id', removeCompany);

export default router;
