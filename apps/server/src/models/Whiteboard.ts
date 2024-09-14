import mongoose, { type Document, Schema } from 'mongoose';

// TypeScript types matching the styleSchema
interface Style {
  color?: string;
  fill?: string;
  line?: string;
  size?: string;
  animated?: boolean;
  opacity?: number;
}

// TypeScript types matching the nodePropsSchema
interface Point {
  x: number;
  y: number;
}

interface NodeProps {
  id?: string;
  point: number[]; // Changed to number[] based on provided data
  points?: number[][]; // Changed to number[][] based on provided data
  width?: number;
  height?: number;
  rotation?: number;
  visible?: boolean;
}

// TypeScript types matching the nodeSchema
interface Node {
  type: 'arrow' | 'rectangle' | 'ellipse' | 'draw' | 'text';
  nodeProps?: NodeProps;
  text?: string | null;
  style?: Style;
}

// TypeScript types matching the diagramSchema
interface StageConfig {
  scale?: number;
  position?: Point;
}

interface CurrentNodeStyle {
  color?: string;
  size?: string;
  animated?: boolean;
  line?: string;
  opacity?: number;
  fill?: string;
}

export interface IDiagram extends Document {
  name: string;
  nodes: Node[];
  stageConfig?: StageConfig;
  toolType?: string;
  selectedNodeIds?: Record<string, boolean>; // Changed to Record<string, boolean> based on provided data
  copiedNodes?: Node[];
  currentNodeStyle?: CurrentNodeStyle;
  createdAt?: Date;
  updatedAt?: Date;
}

// Creating Mongoose schemas with TypeScript interfaces
const styleSchema = new Schema<Style>({
  color: { type: String },
  fill: { type: String },
  line: { type: String },
  size: { type: String },
  animated: { type: Boolean },
  opacity: { type: Number },
});

const nodePropsSchema = new Schema<NodeProps>({
  id: { type: String },
  point: {
    type: [Number], // Changed to [Number] based on provided data
    required: true,
  },
  points: [
    {
      type: [Number], // Changed to [Number] based on provided data
    },
  ],
  width: { type: Number },
  height: { type: Number },
  rotation: { type: Number },
  visible: { type: Boolean },
});

const nodeSchema = new Schema<Node>({
  type: {
    type: String,
    enum: ['arrow', 'rectangle', 'ellipse', 'draw', 'text'],
    required: true,
  },
  nodeProps: nodePropsSchema,
  text: { type: String, default: null },
  style: styleSchema,
});

const diagramSchema = new Schema<IDiagram>(
  {
    name: { type: String, required: true },
    nodes: [nodeSchema],
    stageConfig: {
      scale: { type: Number },
      position: {
        x: { type: Number },
        y: { type: Number },
      },
    },
    toolType: { type: String },
    selectedNodeIds: {
      type: Map,
      of: Boolean,
    },
    copiedNodes: [nodeSchema],
    currentNodeStyle: {
      color: { type: String },
      size: { type: String },
      animated: { type: Boolean },
      line: { type: String },
      opacity: { type: Number },
      fill: { type: String },
    },
  },
  { timestamps: true },
);

// Exporting the model
const Diagram = mongoose.model<IDiagram>('Diagram', diagramSchema, 'diagram');
export default Diagram;
