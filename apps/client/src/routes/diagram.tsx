/* eslint-disable @typescript-eslint/no-explicit-any */
import DrawingCanvas from '@/components/Canvas/DrawingCanvas/DrawingCanvas';
import ContextMenu, {
  type ContextMenuType,
} from '@/components/ContextMenu/ContextMenu';
import Loader from '@/components/Elements/Loader/Loader';
import Panels from '@/components/Panels/Panels';
import { LOADING_TEXT } from '@/constants/app';
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
          dispatch(canvasActions.set(data.data.data as any));
        }

        if ((data as any)?.status === 404) {
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
