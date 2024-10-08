import {
  forwardRef,
  useState,
  useCallback,
  useRef,
  useEffect,
  memo,
} from 'react';
import { Layer } from 'react-konva';
import { useAppDispatch, useAppSelector, useAppStore } from '@/stores/hooks';
import {
  canvasActions,
  selectConfig,
  selectCurrentNodeStyle,
  selectSelectedNodeIds,
  selectToolType,
} from '@/services/canvas/slice';
import {
  createNode,
  duplicateNodesAtPosition,
  isValidNode,
} from '@/utils/node';
import {
  getCanvas,
  getIntersectingNodes,
  getLayerNodes,
  getMainLayer,
  getPointerRect,
  getRelativePointerPosition,
  getUnregisteredPointerPosition,
  haveIntersection,
} from './helpers/stage';
import useRefValue from '@/hooks/useRefValue/useRefValue';
import { calculateStageZoomRelativeToPoint } from './helpers/zoom';
import useThrottledFn from '@/hooks/useThrottledFn';
import useDrafts from '@/hooks/useDrafts';
import useEvent from '@/hooks/useEvent/useEvent';
import Nodes from './Nodes';
import CanvasBackground from './CanvasBackground';
import SelectRect from './SelectRect';
import Drafts from './Drafts';
import useSharedRef from '@/hooks/useSharedRef';
import { resetCursor, setCursor, setCursorByToolType } from './helpers/cursor';
import { ARROW_TRANSFORMER, TEXT, TRANSFORMER } from '@/constants/shape';
import { safeJSONParse } from '@/utils/object';
import { LIBRARY } from '@/constants/panels';
import { DRAWING_CANVAS } from '@/constants/canvas';
import SnapLineGuides from '../SnapLineGuides/SnapLineGuides';
import { getLineGuides, snapNodesToEdges } from './helpers/snap';
import * as Styled from './DrawingCanvas.styled';
import type { SnapLineGuide } from './helpers/snap';
import type Konva from 'konva';
import type { DrawPosition } from './helpers/draw';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { NodeObject, NodeType, Point } from 'shared';
import type { LibraryItem } from '@/constants/app';

type Props = {
  width: number;
  height: number;
  onNodesSelect: (nodesIds: string[]) => void;
};

const initialDrawingPosition: DrawPosition = { start: [0, 0], current: [0, 0] };

const DrawingCanvas = forwardRef<Konva.Stage, Props>(
  ({ width, height, onNodesSelect }, forwardedRef) => {
    const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
    const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
    const [drawing, setDrawing] = useState(false);
    const [snapLineGuides, setSnapLineGuides] = useState<SnapLineGuide[]>([]);

    const [drafts, setDrafts] = useDrafts();

    const store = useAppStore();
    const stageConfig = useAppSelector(selectConfig);
    const toolType = useAppSelector(selectToolType);
    const storedSelectedNodeIds = useAppSelector(selectSelectedNodeIds);
    const currentNodeStyle = useAppSelector(selectCurrentNodeStyle);

    const [drawingPosition, setDrawingPosition] = useRefValue(
      initialDrawingPosition,
    );

    const selectRectRef = useRef<Konva.Rect>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const sharedStageRef = useSharedRef(stageRef, forwardedRef);

    const dispatch = useAppDispatch();

    const isHandTool = toolType === 'hand';
    const isSelectTool = toolType === 'select';
    const isSelecting = drawing && isSelectTool;
    const isLayerListening = !isHandTool;
    /**
     * syncs with store state when selected nodes change
     */
    useEffect(() => {
      const nodesIds = Object.keys(storedSelectedNodeIds);
      setSelectedNodeIds(nodesIds);
      onNodesSelect(nodesIds);
    }, [storedSelectedNodeIds, onNodesSelect]);

    /**
     * sets initial cursor
     */
    useEffect(() => {
      const { toolType } = store.getState().canvas.present;
      setCursorByToolType(stageRef.current, toolType);
    }, [store]);

    const handleDrop = useCallback(
      (event: DragEvent) => {
        event.preventDefault();

        if (!event.dataTransfer || !stageRef.current) return;

        const stage = stageRef.current;
        const position = getUnregisteredPointerPosition(event, stage);

        const dataJSON = event.dataTransfer.getData(LIBRARY.dataTransferFormat);
        const libraryItem = safeJSONParse<LibraryItem>(dataJSON);

        if (libraryItem) {
          const duplicatedNodes = duplicateNodesAtPosition(
            libraryItem.elements,
            position,
          );

          dispatch(
            canvasActions.addNodes(duplicatedNodes, { selectNodes: true }),
          );
          dispatch(canvasActions.setToolType('select'));
        }
      },
      [dispatch],
    );

    useEvent('drop', handleDrop, getCanvas(stageRef.current));

    const handleDragOver = useCallback((event: DragEvent) => {
      event.preventDefault();

      if (!stageRef.current) return;
    }, []);

    useEvent('dragover', handleDragOver, getCanvas(stageRef.current));

    const throttledOnNodesSelect = useThrottledFn(onNodesSelect);

    const handleSelectDraw = useCallback(
      (childrenNodes: ReturnType<typeof getLayerNodes>) => {
        if (!selectRectRef.current) return;

        const selectRect = selectRectRef.current.getClientRect();

        const nodesIntersectedWithSelectRect = getIntersectingNodes(
          childrenNodes,
          selectRect,
        );

        const nodesIds = nodesIntersectedWithSelectRect.map((node) =>
          node.id(),
        );

        setSelectedNodeIds(nodesIds);
        throttledOnNodesSelect(nodesIds);
      },
      [throttledOnNodesSelect],
    );

    const handleDraftCreate = useCallback(
      (toolType: NodeType, position: Point) => {
        const shouldResetToolType = toolType === 'text';

        const node = createNode(toolType, position, currentNodeStyle);

        setDrafts({ type: 'create', payload: { node } });
        setEditingNodeId(node.nodeProps.id);

        if (shouldResetToolType) {
          dispatch(canvasActions.setToolType('select'));
          resetCursor(stageRef.current);
        }
      },
      [currentNodeStyle, dispatch, setDrafts],
    );

    const handleDraftDraw = useCallback(
      (position: DrawPosition) => {
        if (!editingNodeId) return;

        const nodeId = editingNodeId;

        setDrafts({ type: 'draw', payload: { position, nodeId } });
      },
      [editingNodeId, setDrafts],
    );

    const handleDraftDelete = useCallback(
      (node: NodeObject) => {
        if (!drawing) {
          setDrafts({ type: 'finish', payload: { nodeId: node.nodeProps.id } });
        }
      },
      [drawing, setDrafts],
    );

    const handleDraftFinish = useCallback(
      (node: NodeObject) => {
        const isLaserType = node.type === 'laser';
        const isNodeSavable = !isLaserType;
        const shouldKeepDraft = isLaserType;
        const shouldResetToolType = node.type !== 'draw' && !isLaserType;

        setDrafts({
          type: 'finish',
          payload: { nodeId: node.nodeProps.id, keep: shouldKeepDraft },
        });

        setEditingNodeId(null);

        if (shouldResetToolType) {
          dispatch(canvasActions.setToolType('select'));
          resetCursor(stageRef.current);
        }

        if (!isValidNode(node)) {
          return;
        }

        if (isNodeSavable) {
          dispatch(
            canvasActions.addNodes([node], {
              selectNodes: shouldResetToolType,
            }),
          );
        }
      },
      [dispatch, setDrafts],
    );

    const handleNodePress = useCallback(
      (nodeId: string) => {
        if (isSelectTool) {
          dispatch(canvasActions.setSelectedNodeIds([nodeId]));
        }
      },
      [isSelectTool, dispatch],
    );

    const handlePointerDown = useCallback(
      (event: KonvaEventObject<PointerEvent>) => {
        if (event.evt.button !== 0 || toolType === 'hand') {
          return;
        }

        const stage = event.target.getStage();

        const clickedOnEmpty = event.target === stage;

        if (!clickedOnEmpty) {
          const nodeId = event.target.id();

          if (nodeId) {
            handleNodePress(nodeId);
          }

          return;
        }

        const pointerPosition = getRelativePointerPosition(stage);

        setDrawingPosition({
          start: pointerPosition,
          current: pointerPosition,
        });

        if (toolType !== 'text') {
          setDrawing(true);
        }

        if (toolType !== 'select') {
          handleDraftCreate(toolType, pointerPosition);
        }

        if (editingNodeId) {
          setEditingNodeId(null);
        }

        setSelectedNodeIds([]);
        dispatch(canvasActions.setSelectedNodeIds([]));
      },
      [
        toolType,
        editingNodeId,
        handleDraftCreate,
        setDrawingPosition,
        handleNodePress,
        dispatch,
      ],
    );

    const handlePointerMove = useCallback(
      (event: KonvaEventObject<PointerEvent>) => {
        const stage = event.target.getStage();

        if (!stage) {
          return;
        }

        const pointerPosition = getRelativePointerPosition(stage);

        setDrawingPosition((prevPosition) => {
          return { start: prevPosition.start, current: pointerPosition };
        });

        if (toolType === 'select') {
          const layer = getMainLayer(stage);
          const children = getLayerNodes(layer);

          return handleSelectDraw(children);
        }

        handleDraftDraw(drawingPosition.current);
      },
      [
        toolType,
        drawingPosition,
        handleDraftDraw,
        handleSelectDraw,
        setDrawingPosition,
      ],
    );

    const handlePointerUp = useCallback(
      (event: KonvaEventObject<PointerEvent>) => {
        const stage = event.target.getStage();

        if (!stage) {
          return;
        }

        /**
         * [TODO]: temporary fix
         *
         *         pointerup is not being triggered in the parent element
         *
         *         either a bug in radix-ui or Konva, or maybe something else
         *
         *         it is working when the stage size is small
         *         tested with: 500x500 and it is working. window.innerWidth/Height is not
         */
        stage.container().dispatchEvent(new Event(event.type, event.evt));

        setDrawing(false);

        if (isSelecting) {
          dispatch(canvasActions.setSelectedNodeIds(selectedNodeIds));
          return;
        }

        const draft = drafts.find(
          ({ node }) => node.nodeProps.id === editingNodeId,
        );

        if (draft && draft.node.type !== 'text') {
          handleDraftFinish(draft.node);
        }
      },
      [
        isSelecting,
        selectedNodeIds,
        drafts,
        editingNodeId,
        dispatch,
        handleDraftFinish,
      ],
    );

    const zoomStageRelativeToPointerPosition = useCallback(
      (stage: Konva.Stage, deltaY: number) => {
        const pointerPosition = stage.getPointerPosition() || { x: 0, y: 0 };
        const stagePosition = stage.position();
        const stageScale = stage.scaleX();

        const updatedStageConfig = calculateStageZoomRelativeToPoint(
          stageScale,
          pointerPosition,
          stagePosition,
          deltaY > 0 ? -1 : 1,
        );

        dispatch(canvasActions.setStageConfig(updatedStageConfig));
      },
      [dispatch],
    );

    const handleOnWheel = useCallback(
      (event: KonvaEventObject<WheelEvent>) => {
        event.evt.preventDefault();

        const stage = event.target.getStage();

        if (!editingNodeId && event.evt.ctrlKey && stage) {
          zoomStageRelativeToPointerPosition(stage, event.evt.deltaY);
        }
      },
      [editingNodeId, zoomStageRelativeToPointerPosition],
    );

    const handleStageDragStart = useCallback(
      (event: KonvaEventObject<DragEvent>) => {
        const stage = event.target.getStage();

        if (
          toolType === 'hand' ||
          event.target.name() === ARROW_TRANSFORMER.ANCHOR_NAME
        ) {
          setCursor(stage, 'grabbing');
        } else if (toolType === 'select') {
          setCursor(stage, 'all-scroll');
        }
      },
      [toolType],
    );

    const handleStageDragEnd = useCallback(
      (event: KonvaEventObject<DragEvent>) => {
        const stage = event.target.getStage();

        if (
          toolType === 'hand' ||
          event.target.name() === ARROW_TRANSFORMER.ANCHOR_NAME
        ) {
          setCursor(stage, 'grab');

          const draggedStage = event.target === stage;

          if (draggedStage) {
            dispatch(
              canvasActions.setStageConfig({ position: stage.getPosition() }),
            );
          }
        } else if (toolType === 'select') {
          resetCursor(stage);
        } else {
          setCursor(stage, 'crosshair');
        }
      },
      [toolType, dispatch],
    );

    const handleLayerDragMove = useCallback(
      (event: Konva.KonvaEventObject<DragEvent>) => {
        if (!event.evt.ctrlKey) {
          setSnapLineGuides([]);
          return;
        }

        if (!event.target.hasName(TRANSFORMER.NAME)) {
          return;
        }

        const transformer = event.target as unknown as Konva.Transformer;

        const guides = getLineGuides(transformer);

        setSnapLineGuides(guides);

        if (guides.length) {
          snapNodesToEdges(guides, transformer);
        }
      },
      [],
    );

    const handleLayerDragEnd = useCallback(() => {
      setSnapLineGuides([]);
    }, []);

    const handleOnContextMenu = useCallback(
      (event: KonvaEventObject<PointerEvent>) => {
        if (editingNodeId) {
          event.evt.preventDefault();
          event.evt.stopPropagation();
          return;
        }

        const clickedOnEmpty = event.target === event.target.getStage();

        if (clickedOnEmpty) {
          onNodesSelect([]);
          dispatch(canvasActions.setSelectedNodeIds([]));
        } else if (!event.target.parent?.hasName(TRANSFORMER.NAME)) {
          onNodesSelect([event.target.id()]);
          dispatch(canvasActions.setSelectedNodeIds([event.target.id()]));
        }
      },
      [editingNodeId, dispatch, onNodesSelect],
    );

    const handleDoublePress = useCallback(
      (event: KonvaEventObject<MouseEvent | Event>) => {
        if (
          toolType !== 'select' ||
          ('button' in event.evt && event.evt.button !== 0)
        ) {
          return;
        }

        const stage = event.target.getStage();

        if (!stage) {
          return;
        }

        const clickedOnEmpty = event.target === stage;

        if (!clickedOnEmpty && event.target.parent?.hasName(TRANSFORMER.NAME)) {
          const transformer = event.target.parent as Konva.Transformer;
          const position = stage.getPointerPosition() as Konva.Vector2d;
          const pointerRect = getPointerRect(position);

          const textNode = transformer.nodes().find((node) => {
            return (
              haveIntersection(node.getClientRect(), pointerRect) &&
              node.hasName(TEXT.NAME)
            );
          });

          if (textNode) {
            setEditingNodeId(textNode.id());
            dispatch(canvasActions.setSelectedNodeIds([textNode.id()]));
          }
          return;
        }

        const position = getRelativePointerPosition(stage);
        handleDraftCreate('text', position);
      },
      [toolType, handleDraftCreate, dispatch],
    );

    const handleNodesChange = useCallback(
      (nodes: NodeObject[]) => {
        dispatch(canvasActions.updateNodes(nodes));
        setEditingNodeId(null);
      },
      [dispatch],
    );

    return (
      <Styled.Stage
        ref={sharedStageRef}
        tabIndex={0}
        name={DRAWING_CANVAS.NAME}
        className={DRAWING_CANVAS.CONTAINER_CLASS}
        x={stageConfig.position.x}
        y={stageConfig.position.y}
        width={width}
        height={height}
        scaleX={stageConfig.scale}
        scaleY={stageConfig.scale}
        draggable={isHandTool}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleOnWheel}
        onDragStart={handleStageDragStart}
        onDragEnd={handleStageDragEnd}
        onContextMenu={handleOnContextMenu}
        onDblClick={handleDoublePress}
        onDblTap={handleDoublePress}
      >
        <Layer
          listening={isLayerListening}
          onDragMove={handleLayerDragMove}
          onDragEnd={handleLayerDragEnd}
        >
          <CanvasBackground
            x={stageConfig.position.x}
            y={stageConfig.position.y}
            width={width}
            height={height}
            stageScale={stageConfig.scale}
          />
          <Nodes
            selectedNodeIds={isSelectTool ? selectedNodeIds : []}
            editingNodeId={isSelectTool ? editingNodeId : null}
            stageScale={stageConfig.scale}
            onNodesChange={handleNodesChange}
          />
          <Drafts
            drafts={drafts}
            stageScale={stageConfig.scale}
            editingNodeId={isSelectTool ? editingNodeId : null}
            onNodeChange={handleDraftFinish}
            onNodeDelete={handleDraftDelete}
          />
          {isSelecting && (
            <SelectRect
              ref={selectRectRef}
              position={drawingPosition.current}
            />
          )}
          <SnapLineGuides lineGuides={snapLineGuides} />
        </Layer>
      </Styled.Stage>
    );
  },
);

DrawingCanvas.displayName = 'DrawingCanvas';

export default memo(DrawingCanvas);
