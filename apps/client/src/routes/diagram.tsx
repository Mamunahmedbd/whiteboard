import DrawingCanvas from '@/components/Canvas/DrawingCanvas/DrawingCanvas';
import ContextMenu, {
  type ContextMenuType,
} from '@/components/ContextMenu/ContextMenu';
import Loader from '@/components/Elements/Loader/Loader';
import Panels from '@/components/Panels/Panels';
import { type AppState, LOADING_TEXT } from '@/constants/app';
import useWindowSize from '@/hooks/useWindowSize/useWindowSize';
import api from '@/services/api';
import { canvasActions } from '@/services/canvas/slice';
import { useAppDispatch } from '@/stores/hooks';
import type Konva from 'konva';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function Diagram() {
  const { diagramId } = useParams();
  const [loading, setLoading] = useState(true);
  const [menuType, setMenuType] = useState<ContextMenuType>('canvas-menu');
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const stageRef = useRef<Konva.Stage>(null);
  const windowSize = useWindowSize();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleContextMenuOpen = useCallback(
    (open: boolean) => {
      if (!open) {
        return;
      }

      setMenuType(selectedNodeIds.length ? 'node-menu' : 'canvas-menu');
    },
    [selectedNodeIds.length],
  );

  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true); // Set loading to true before fetching
        const data = await api.getDiagram(diagramId as string, {
          signal: abortController.signal,
        });

        if (data?.data && data.data.data._id) {
          dispatch(canvasActions.set(data.data.data as AppState['page']));
          // dispatch(
          //   canvasActions.set({
          //     _id: '66e573c1db1d484db5c86041',
          //     name: 'testing',
          //     nodes: [
          //       {
          //         type: 'rectangle',
          //         nodeProps: {
          //           id: '5eb3204a-6601-48fd-bfc2-cb6575305a25',
          //           point: [594.4000244140625, 209.80003356933594],
          //           width: 81.5999755859375,
          //           height: 71.99998474121094,
          //           rotation: 0,
          //           visible: true,
          //         },
          //         text: null,
          //         style: {
          //           color: 'teal600',
          //           line: 'dotted',
          //           size: 'medium',
          //           animated: true,
          //           opacity: 1,
          //         },
          //       },
          //     ],
          //     stageConfig: {
          //       scale: 1,
          //       position: {
          //         x: 0,
          //         y: 0,
          //       },
          //     },
          //     toolType: 'select',
          //     selectedNodeIds: {
          //       '5eb3204a-6601-48fd-bfc2-cb6575305a25': true,
          //     },
          //     copiedNodes: [],
          //     currentNodeStyle: {
          //       color: 'teal600',
          //       size: 'medium',
          //       animated: true,
          //       line: 'dotted',
          //       opacity: 1,
          //     },
          //   }),
          // );
        }

        if (data?.status === 404) {
          navigate('/');
          return;
        }
      } catch (err) {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      abortController.abort();
    };
  }, [diagramId, dispatch, navigate]);

  // const storedCanvasState = storage.get<AppState['page']>(LOCAL_STORAGE_KEY);
  return (
    <>
      <Panels selectedNodeIds={selectedNodeIds} />
      {loading && <Loader fullScreen>{LOADING_TEXT}</Loader>}
      {!loading && (
        <Suspense fallback={<Loader fullScreen>{LOADING_TEXT}</Loader>}>
          <ContextMenu
            menuType={menuType}
            onContextMenuOpen={handleContextMenuOpen}
          >
            <ContextMenu.Trigger>
              <DrawingCanvas
                ref={stageRef}
                width={windowSize.width}
                height={windowSize.height}
                onNodesSelect={setSelectedNodeIds}
              />
            </ContextMenu.Trigger>
          </ContextMenu>
        </Suspense>
      )}
    </>
  );
}
