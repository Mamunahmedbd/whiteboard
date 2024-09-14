/* eslint-disable @typescript-eslint/naming-convention */
import type { z } from 'zod';
import { Node } from '../schemas/node';
import type {
  GetPageResponse,
  SharePageRequestBody,
  SharePageResponse,
  StageConfig,
  UpdatePageBody,
  UpdatePageResponse,
} from '../schemas/page';
import type { QRCodeRequestBody, QRCodeResponse } from '../schemas/qrcode';
import type { defaultTheme, darkTheme } from '../design/theme';

const { nodeProps, style, type } = Node.shape;

export interface NodeObject<T extends NodeType = NodeType>
  extends z.infer<typeof Node> {
  type: T;
}
export type NodeProps = z.infer<typeof nodeProps>;
export type NodeStyle = z.infer<typeof style>;
export type NodeType = z.infer<typeof type>;

export type DrawableNodeType = Exclude<NodeType, 'text'>;

export type NodeLine = NodeStyle['line'];
export type NodeSize = NodeStyle['size'];
export type NodeColor = NodeStyle['color'];
export type NodeFill = NodeStyle['fill'];
export type ArrowStartHead = NodeStyle['arrowStartHead'];
export type ArrowEndHead = NodeStyle['arrowEndHead'];

export type ArrowHead = ArrowEndHead | ArrowStartHead;
export type ArrowHeadDirection = 'start' | 'end';

export type Point = z.infer<(typeof nodeProps)['shape']['point']>;

export type StageConfig = z.infer<typeof StageConfig>;

export type ThemeColors =
  | (typeof defaultTheme)['colors']
  | (typeof darkTheme)['colors'];
export type ThemeColorValue = ThemeColors[keyof ThemeColors]['value'];
export type ThemeColorKey = keyof ThemeColors;

export type SharePageRequestBody = z.infer<typeof SharePageRequestBody>;
export type SharePageResponse = z.infer<typeof SharePageResponse>;

export type GetPageResponse = z.infer<typeof GetPageResponse>;

export type UpdatePageRequestBody = z.infer<typeof UpdatePageBody>;
export type UpdatePageResponse = z.infer<typeof UpdatePageResponse>;

export type QRCodeRequestBody = z.infer<typeof QRCodeRequestBody>;
export type QRCodeResponse = z.infer<typeof QRCodeResponse>;

export type Style = {
  color?: string;
  fill?: string;
  line?: string;
  size?: string;
  animated?: boolean;
  opacity?: number;
  arrowStartHead?: string;
  arrowEndHead?: string;
};

// TypeScript types matching the nodeSchema
interface Node {
  type: 'arrow' | 'rectangle' | 'ellipse' | 'draw' | 'text' | 'laser';
  nodeProps?: NodeProps;
  text?: string | null;
  style?: Style;
}

interface CurrentNodeStyle {
  color?: string;
  size?: string;
  animated?: boolean;
  line?: string;
  opacity?: number;
  fill?: string;
}

export type IDiagram = {
  _id: string;
  name: string;
  nodes: Node[];
  stageConfig?: StageConfig;
  toolType?: string;
  selectedNodeIds?: Map<string, boolean>;
  copiedNodes?: Node[];
  currentNodeStyle?: CurrentNodeStyle;
  createdAt?: Date;
  updatedAt?: Date;
};

export type GenericResponse<T> = {
  data: T;
  message?: string;
  status?: number;
  success?: boolean;
};

export * from './ws';
