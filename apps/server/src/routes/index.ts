import type { Application, Request, Response } from 'express';
import diagramRoutes from './diagram.routes';

export const appRoutes = (app: Application) => {
  app.use('/v1/diagrams', diagramRoutes);

  // health check
  app.get('/health', (req, res) => res.sendStatus(200));

  /**
   * ==== 404 Resource Not Found =====
   */
  app.get('*', (req: Request, res: Response) => {
    res.sendStatus(404).json({
      success: false,
      message: 'Resource not found!',
    });
  });
};
