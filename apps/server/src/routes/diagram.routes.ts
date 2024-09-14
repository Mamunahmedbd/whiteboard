import DiagramController from '@/controllers/diagram.controller';
import { Router } from 'express';

const diagramRoutes = Router();

/**
 * ==== Diagram Routes ====
 */
diagramRoutes
  .get('/', DiagramController.getAllDiagrams)
  .get('/:diagramId', DiagramController.diagramById)
  .post('/', DiagramController.createDiagram)
  .put('/:diagramId', DiagramController.editDiagram)
  .delete('/:diagramId', DiagramController.deleteDiagram);

export default diagramRoutes;
