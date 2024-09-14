import { useCallback, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import type Konva from 'konva';

import { useAppDispatch, useAppStore } from '@/stores/hooks';
import { canvasActions } from '@/services/canvas/slice';
import { storage } from '@/utils/storage';
import useAutoFocus from './hooks/useAutoFocus/useAutoFocus';
import { LOCAL_STORAGE_LIBRARY_KEY } from '@/constants/app';
import { TOOLS } from './constants/panels';
import { KEYS } from './constants/keys';
import { libraryActions } from '@/services/library/slice';
import { historyActions } from './stores/reducers/history';
import { setCursorByToolType } from './components/Canvas/DrawingCanvas/helpers/cursor';
import * as Styled from './App.styled';
import type { Library } from '@/constants/app';
import type { HistoryActionKey } from './stores/reducers/history';
import { ModalProvider } from './contexts/modal';

const App = () => {
  const store = useAppStore();
  const appWrapperRef = useAutoFocus<HTMLDivElement>();
  const stageRef = useRef<Konva.Stage>(null);

  const dispatch = useAppDispatch();

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const state = store.getState().canvas.present;

      const { key, shiftKey, ctrlKey } = event;
      const lowerCaseKey = key.toLowerCase();

      const onCtrlKey = (key: string) => {
        switch (key) {
          case KEYS.A: {
            event.preventDefault();
            dispatch(canvasActions.selectAllNodes());
            break;
          }
          case KEYS.Z: {
            const actionKey: HistoryActionKey = shiftKey ? 'redo' : 'undo';
            const action = historyActions[actionKey];

            dispatch(action());
            break;
          }
          case KEYS.D: {
            event.preventDefault();

            const selectedNodes = state.nodes.filter(
              (node) => node.nodeProps.id in state.selectedNodeIds,
            );

            dispatch(
              canvasActions.addNodes(selectedNodes, {
                duplicate: true,
                selectNodes: true,
              }),
            );
            break;
          }
          case KEYS.C: {
            dispatch(canvasActions.copyNodes());
            break;
          }
          case KEYS.V: {
            dispatch(
              canvasActions.addNodes(state.copiedNodes, {
                duplicate: true,
                selectNodes: true,
              }),
            );
            break;
          }
        }
      };

      if (ctrlKey) {
        return onCtrlKey(lowerCaseKey);
      }

      if (key === KEYS.DELETE) {
        dispatch(canvasActions.deleteNodes(Object.keys(state.selectedNodeIds)));
        return;
      }

      const toolByKey = TOOLS.find((tool) => tool.key === lowerCaseKey);

      if (toolByKey) {
        dispatch(canvasActions.setToolType(toolByKey.value));
        setCursorByToolType(stageRef.current, toolByKey.value);
      }
    },
    [store, dispatch],
  );

  useEffect(() => {
    const storedLibrary = storage.get<Library>(LOCAL_STORAGE_LIBRARY_KEY);

    if (storedLibrary) {
      dispatch(libraryActions.set(storedLibrary));
    }
  }, [dispatch]);

  return (
    <ModalProvider>
      <Styled.AppWrapper
        ref={appWrapperRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <Outlet />
      </Styled.AppWrapper>
    </ModalProvider>
  );
};

export default App;
