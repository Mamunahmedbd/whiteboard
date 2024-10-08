import { memo, useCallback, useEffect, useState } from 'react';
import { Layer } from 'react-konva';
import { useAppSelector } from '@/stores/hooks';
import { selectCollaborators } from '@/services/collaboration/slice';
import NodeDraft from '../Node/NodeDraft';
import UserCursor from './UserCursor';
import useDrafts from '@/hooks/useDrafts';
import useThemeColors from '@/hooks/useThemeColors';
import { selectConfig } from '@/services/canvas/slice';
import { noop } from '@/utils/is';
import { getColorValue } from '@/utils/shape';
import * as Styled from './CollabCanvas.styled';
import type { NodeObject, Point } from 'shared';
import { COLLAB_CANVAS } from '@/constants/canvas';

type Props = {
  width: number;
  height: number;
};

type UserPosition = { [id: string]: Point };

const CollaborationCanvas = ({ width, height }: Props) => {
  const [userPositions, setUserPositions] = useState<UserPosition>({});
  const [drafts, setDrafts] = useDrafts();

  const stageConfig = useAppSelector(selectConfig);
  const collaborators = useAppSelector(selectCollaborators);

  const themeColors = useThemeColors();

  const handleNodeDelete = useCallback(
    (node: NodeObject) => {
      const isDrawing = drafts.some(
        (draft) =>
          draft.node.nodeProps.id === node.nodeProps.id && draft.drawing,
      );

      if (!isDrawing) {
        setDrafts({
          type: 'finish',
          payload: { nodeId: node.nodeProps.id },
        });
      }
    },
    [drafts, setDrafts],
  );

  return (
    <Styled.Stage
      name={COLLAB_CANVAS.NAME}
      x={stageConfig.position.x}
      y={stageConfig.position.y}
      width={width}
      height={height}
      scaleX={stageConfig.scale}
      scaleY={stageConfig.scale}
      listening={false}
    >
      <Layer listening={false}>
        {drafts.map(({ node }) => {
          return (
            <NodeDraft
              key={node.nodeProps.id}
              node={node}
              stageScale={stageConfig.scale}
              onNodeChange={noop}
              onNodeDelete={handleNodeDelete}
            />
          );
        })}
        {collaborators.map((user) => {
          const position = userPositions[user.id];

          if (!position) return null;

          return (
            <UserCursor
              key={user.id}
              name={user.name}
              color={getColorValue(user.color, themeColors)}
              position={position}
              stageScale={stageConfig.scale}
            />
          );
        })}
      </Layer>
    </Styled.Stage>
  );
};

export default memo(CollaborationCanvas);
