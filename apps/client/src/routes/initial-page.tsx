import DrawingCanvas from '@/components/Canvas/DrawingCanvas/DrawingCanvas';
import ContextMenu, {
  type ContextMenuType,
} from '@/components/ContextMenu/ContextMenu';
import Loader from '@/components/Elements/Loader/Loader';
import Panels from '@/components/Panels/Panels';
import { LOADING_TEXT, LOCAL_STORAGE_KEY } from '@/constants/app';
import useWindowSize from '@/hooks/useWindowSize/useWindowSize';
import { canvasActions } from '@/services/canvas/slice';
import { useAppDispatch } from '@/stores/hooks';
import { storage } from '@/utils/storage';
import type Konva from 'konva';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';

export default function InitialPage() {
  const [menuType, setMenuType] = useState<ContextMenuType>('canvas-menu');
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const stageRef = useRef<Konva.Stage>(null);
  const windowSize = useWindowSize();
  const dispatch = useAppDispatch();

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
    dispatch(canvasActions.reset());
    storage.remove(LOCAL_STORAGE_KEY);
  }, [dispatch]);

  return (
    <>
      <Panels selectedNodeIds={selectedNodeIds} />
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
    </>
  );
}
