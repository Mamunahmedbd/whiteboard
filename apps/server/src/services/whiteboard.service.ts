/* eslint-disable @typescript-eslint/naming-convention */
// Service for Whiteboard
import Diagram, { type IDiagram } from '@/models/Whiteboard';
import { type FlattenMaps } from 'mongoose';

class DiagramService {
  /**
   * ---- Get diagrams ----
   * @returns
   */
  static async getDiagrams(): Promise<FlattenMaps<IDiagram[]> | boolean> {
    // order by createdAt
    const diagrams = await Diagram.find()
      .sort({ createdAt: -1 })
      .select('name')
      .lean()
      .exec();
    if (!diagrams.length) return false;
    return diagrams;
  }

  /**
   * ---- Create diagram ----
   * @param diagramData
   * @returns
   */
  static async createDiagram(
    diagramData: IDiagram,
  ): Promise<IDiagram | boolean> {
    const diagram = new Diagram(diagramData);
    console.log({ diagram });
    if (!diagram) return false;
    await diagram.save();
    return diagram;
  }

  /**
   * ---- Update diagram ----
   * @param id
   * @param diagramData
   * @returns
   */
  static async updateDiagram(
    id: string,
    diagramData: Partial<Omit<IDiagram, 'id'>>,
  ): Promise<FlattenMaps<unknown> | boolean> {
    const updatedDiagram = await Diagram.findByIdAndUpdate(id, diagramData, {
      new: true,
      runValidators: true,
    })
      .select('_id')
      .lean();

    if (!updatedDiagram) return false;
    return updatedDiagram._id;
  }

  /**
   * ---- Delete diagram ----
   * @param id
   * @returns
   */
  static async deleteDiagram(
    id: string,
  ): Promise<{ _id: FlattenMaps<unknown> } | null> {
    const deletedDiagram = await Diagram.findByIdAndDelete(id)
      .select('_id')
      .lean();

    if (!deletedDiagram) return null;
    return deletedDiagram;
  }

  /**
   *  ---- Get diagram by id ----
   * @param id
   * @returns
   */
  static async diagramById(id: string): Promise<FlattenMaps<IDiagram> | null> {
    const diagram = await Diagram.findById(id)
      .select({
        name: 1,
        nodes: 1,
        stageConfig: 1,
        toolType: 1,
        selectedNodeIds: 1,
        copiedNodes: 1,
        currentNodeStyle: 1,
      })
      .lean();

    if (!diagram) return null;
    return diagram;
  }
}

export default DiagramService;
