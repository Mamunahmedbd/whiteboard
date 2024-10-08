import { Schemas } from 'shared';
import { z } from 'zod';
import type { User } from 'shared';

export const BASE_URL = 'https://whiteboard-api.ispcrmcloud.com/v1';

export const IS_PROD = process.env.NODE_ENV === 'production';

export const LOCAL_STORAGE_KEY = 'whiteboard';
export const LOCAL_STORAGE_LIBRARY_KEY = 'whiteboard-library';
export const LOCAL_STORAGE_THEME_KEY = 'whiteboard-theme';

export const PROJECT_FILE_EXT = 'whiteboard';
export const PROJECT_FILE_NAME = 'project';
export const PROJECT_PNG_NAME = 'project';
export const PROJECT_PNG_EXT = 'png';

export const LOADING_TEXT = 'Loading assets...';

export const USER = {
  maxNameLength: 10,
};

export const ZOOM_RANGE: [Min: number, Max: number] = [0.1, 10];
export const ZOOM_MULTIPLIER_VALUE = 0.1;
export const ZOOM_WHEEL_STEP = 1.1;
export const DEFAULT_ZOOM_VALUE = 1;

const CanvasSchema = Schemas.Page.shape.page.shape;
const ShapeTools = Schemas.Node.shape.type.options;

const LibraryItem = z.object({
  created: z.number().int().min(0),
  id: z.string().uuid(),
  elements: Schemas.Node.array(),
});

export const appState = z.object({
  page: z.object({
    ...CanvasSchema,
    toolType: z.union([...ShapeTools, z.literal('hand'), z.literal('select')]),
    selectedNodeIds: z.record(z.string(), z.boolean()),
    currentNodeStyle: Schemas.Node.shape.style,
  }),
});

export const libraryState = z.object({
  items: LibraryItem.array(),
});

export type AppState = z.infer<typeof appState>;
export type LibraryItem = z.infer<typeof LibraryItem>;
export type Library = z.infer<typeof libraryState>;
export type ToolType = AppState['page']['toolType'];
export type StoredCollabState = { user: Omit<User, 'id'> };
