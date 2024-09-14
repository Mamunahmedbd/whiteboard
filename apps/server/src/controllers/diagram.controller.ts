import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

import { type ControllerFunction } from '@/common/types';
import catchAsyncErrorHandle from '@/middlewares/catchAsyncErrors';
import type { IDiagram } from '@/models/Whiteboard';
import DiagramService from '@/services/whiteboard.service';

class DiagramController {
  /**
   * ----- Diagram Delete -----
   */
  static deleteDiagram: ControllerFunction = catchAsyncErrorHandle(
    async (
      req: Request<Record<string, string>, unknown, unknown>,
      res: Response,
    ) => {
      const { diagramId } = req.params;

      const diagram = await DiagramService.deleteDiagram(diagramId);
      if (!diagram)
        return res.status(203).json({
          success: false,
          message: 'Can not Delete this diagram!',
        });

      res.status(200).json({
        success: true,
        message: 'Diagram Deleted Successfully',
        data: diagram._id,
      });
    },
  );

  /**
   * ----- Diagram edit -----
   */

  static editDiagram: ControllerFunction = catchAsyncErrorHandle(
    async (
      req: Request<Record<string, string>, unknown, Omit<IDiagram, 'id'>>,
      res: Response,
    ) => {
      const data = req.body;
      const { diagramId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(diagramId)) {
        console.log('Invalid ID format');
        return res.status(404).json({
          success: false,
          message: 'Invalid ID format',
        });
      }

      const diagram = await DiagramService.updateDiagram(diagramId, data);

      if (!diagram)
        return res.status(404).json({
          success: false,
          message: 'Can not update this diagram!',
        });

      res.status(200).json({
        success: true,
        message: 'Diagram updated Successfully',
        data: { id: diagram },
      });
    },
  );

  /**
   * ---- Get Diagram By Id ----
   */
  static diagramById: ControllerFunction = catchAsyncErrorHandle(
    async (
      req: Request<Record<string, string>>,
      res: Response,
      _next: NextFunction,
    ) => {
      const { diagramId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(diagramId)) {
        console.log('Invalid ID format');
        return res.status(404).json({
          success: false,
          message: 'Invalid ID format',
          status: 404,
        });
      }

      const diagram = await DiagramService.diagramById(diagramId);
      if (!diagram)
        return res.status(404).json({
          success: false,
          message: 'Diagram post not found',
          status: 404,
        });

      // Transform the diagram's nodes to remove empty 'points' arrays
      const transformedNodes = diagram.nodes.map((node) => {
        const { points, ...restNodeProps } = node.nodeProps || {};

        return {
          ...node,
          nodeProps: {
            ...restNodeProps,
            ...(points && points.length > 0 ? { points } : {}),
          },
        };
      });

      res.status(200).json({
        success: true,
        message: 'Diagram is fetched successfully',
        data: {
          ...diagram,
          nodes: transformedNodes,
        },
      });
    },
  );

  /**
   * ---- See All Blogs ----
   */
  static getAllDiagrams: ControllerFunction = catchAsyncErrorHandle(
    async (req: Request, res: Response, _next: NextFunction) => {
      const diagrams = await DiagramService.getDiagrams();
      if (!diagrams)
        return res.status(401).json({
          success: false,
          message: 'No Diagrams Found',
        });

      res.status(200).json({
        success: true,
        data: diagrams,
      });
    },
  );

  /**
   * ---- Create diagram ----
   */
  static createDiagram: ControllerFunction = catchAsyncErrorHandle(
    async (
      req: Request<Record<string, unknown>, unknown, IDiagram>,
      res: Response,
      _next: NextFunction,
    ) => {
      const data = req.body;

      const diagram = await DiagramService.createDiagram(data);
      console.log({ diagram });
      if (!diagram)
        return res.status(400).json({
          success: false,
          message: 'Can not create diagram!',
        });

      res.status(200).json({
        success: true,
        message: 'Diagram Successfully Created!',
        data: diagram,
      });
    },
  );
}

export default DiagramController;
