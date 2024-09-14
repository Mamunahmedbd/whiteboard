import { useCallback, memo } from 'react';
import { useModal } from '@/contexts/modal';
import { useAppDispatch, useAppSelector, useAppStore } from '@/stores/hooks';
import {
  canvasActions,
  selectConfig,
  selectToolType,
  useSelectNodesById,
} from '@/services/canvas/slice';
import { downloadDataUrlAsFile, importProject } from '@/utils/file';
import MenuPanel from './MenuPanel/MenuPanel';
import CreateNewDiagramPanel from './NewPanel/NewPanel';
import StylePanel from './StylePanel/StylePanel';
import ToolButtons from './ToolButtons/ToolButtons';
import ZoomButtons from './ZoomButtons';
import SaveDiagramPanel from './SaveDiagram/SaveDiagram';
import DiagramDrawer from '../diagrams/DiagramDrawer/DiagramDrawer';
import LibraryDrawer from '../Library/LibraryDrawer/LibraryDrawer';
import HistoryButtons from './HistoryButtons';
import DeleteButton from './DeleteButton';
import {
  PROJECT_FILE_EXT,
  PROJECT_FILE_NAME,
  PROJECT_PNG_EXT,
} from '@/constants/app';
import { DRAWING_CANVAS } from '@/constants/canvas';
import { historyActions } from '@/stores/reducers/history';
import { selectLibrary } from '@/services/library/slice';
import { calculateCenterPoint } from '@/utils/position';
import { calculateStageZoomRelativeToPoint } from '../Canvas/DrawingCanvas/helpers/zoom';
import * as Styled from './Panels.styled';
import { shallowEqual } from '@/utils/object';
import { setCursorByToolType } from '../Canvas/DrawingCanvas/helpers/cursor';
import { findStageByName } from '@/utils/node';
import type { NodeStyle } from 'shared';
import type {
  HistoryControlKey,
  MenuPanelActionType,
  ZoomActionKey,
} from '@/constants/panels';
import type { ToolType } from '@/constants/app';

type Props = {
  selectedNodeIds: string[];
};

const Panels = ({ selectedNodeIds }: Props) => {
  const store = useAppStore();
  const stageConfig = useAppSelector(selectConfig);
  const toolType = useAppSelector(selectToolType);
  const library = useAppSelector(selectLibrary);

  const selectedNodes = useSelectNodesById(selectedNodeIds);

  const { openModal } = useModal();

  const dispatch = useAppDispatch();

  const isHandTool = toolType === 'hand';
  const showStylePanel =
    selectedNodeIds.length > 0 && toolType !== 'laser' && !isHandTool;

  const handleToolSelect = useCallback(
    (type: ToolType) => {
      dispatch(canvasActions.setToolType(type));

      const stage = findStageByName(DRAWING_CANVAS.NAME);
      setCursorByToolType(stage, type);
    },
    [dispatch],
  );

  const handleStyleChange = (style: Partial<NodeStyle>) => {
    const state = store.getState().canvas.present;

    const nodesToUpdate = state.nodes.filter((node) => {
      return node.nodeProps.id in state.selectedNodeIds;
    });

    const updatedNodes = nodesToUpdate.map((node) => {
      return { ...node, style: { ...node.style, ...style } };
    });

    dispatch(canvasActions.updateNodes(updatedNodes));
    dispatch(canvasActions.setCurrentNodeStyle(style));
  };

  const handleMenuAction = useCallback(
    (type: MenuPanelActionType) => {
      switch (type) {
        case 'export-as-image': {
          const stage = findStageByName(DRAWING_CANVAS.NAME);
          const dataUrl = stage?.toDataURL();

          if (dataUrl) {
            downloadDataUrlAsFile(dataUrl, PROJECT_FILE_NAME, PROJECT_PNG_EXT);
          }
          break;
        }
        case 'save': {
          const state = store.getState().canvas.present;

          const dataUrl = URL.createObjectURL(
            new Blob([JSON.stringify(state)], {
              type: 'application/json',
            }),
          );

          downloadDataUrlAsFile(dataUrl, PROJECT_FILE_NAME, PROJECT_FILE_EXT);
          break;
        }
        case 'open': {
          const openProject = async () => {
            const project = await importProject();

            if (project) {
              dispatch(canvasActions.set(project));

              const stage = findStageByName(DRAWING_CANVAS.NAME);

              setCursorByToolType(stage, project.toolType ?? 'select');
            } else {
              openModal({
                title: 'Error',
                description: 'Could not load file',
              });
            }
          };

          openProject();
        }
      }
    },
    [store, openModal, dispatch],
  );

  const handleZoomChange = useCallback(
    (action: ZoomActionKey) => {
      const stagePosition = stageConfig.position;
      const oldScale = stageConfig.scale;
      const viewportCenter = calculateCenterPoint(
        window.innerWidth,
        window.innerHeight,
      );

      const direction = action === 'reset' ? 0 : action === 'in' ? 1 : -1;

      const updatedStageConfig = calculateStageZoomRelativeToPoint(
        oldScale,
        viewportCenter,
        stagePosition,
        direction,
      );

      dispatch(canvasActions.setStageConfig(updatedStageConfig));
    },
    [stageConfig, dispatch],
  );

  const handleHistoryAction = useCallback(
    (type: HistoryControlKey) => {
      const action = historyActions[type];

      if (action) {
        dispatch(action());
      }
    },
    [dispatch],
  );

  const handleNodesDelete = useCallback(() => {
    dispatch(canvasActions.deleteNodes(selectedNodeIds));
  }, [selectedNodeIds, dispatch]);

  return (
    <Styled.Container>
      <Styled.TopPanels>
        {!isHandTool && (
          <Styled.Panel>
            <HistoryButtons onClick={handleHistoryAction} />
            <DeleteButton
              disabled={!selectedNodeIds.length}
              onClick={handleNodesDelete}
            />
          </Styled.Panel>
        )}
        {showStylePanel && (
          <StylePanel
            selectedNodes={selectedNodes}
            onStyleChange={handleStyleChange}
          />
        )}
        <Styled.Panel css={{ marginLeft: 'auto' }}>
          <CreateNewDiagramPanel />
          <SaveDiagramPanel />
          <DiagramDrawer />
          <LibraryDrawer items={library.items} />
          <MenuPanel onAction={handleMenuAction} />
        </Styled.Panel>
      </Styled.TopPanels>
      <Styled.BottomPanels direction={{ '@initial': 'column', '@xs': 'row' }}>
        <Styled.Panel css={{ '@xs': { marginRight: 'auto' } }}>
          <ZoomButtons
            value={stageConfig.scale}
            onZoomChange={handleZoomChange}
          />
        </Styled.Panel>
        <Styled.Panel css={{ height: '100%' }}>
          <ToolButtons activeTool={toolType} onToolSelect={handleToolSelect} />
        </Styled.Panel>
      </Styled.BottomPanels>
    </Styled.Container>
  );
};

const areEqual = (prevProps: Props, nextProps: Props) => {
  return shallowEqual(prevProps.selectedNodeIds, nextProps.selectedNodeIds);
};

export default memo(Panels, areEqual);
