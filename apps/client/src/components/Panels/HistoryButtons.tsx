import { memo } from 'react';
import Icon from '../Elements/Icon/Icon';
import { HISTORY } from '@/constants/panels';
import { createKeyTitle } from '@/utils/string';
import * as Styled from './Panels.styled';
import type { HistoryControlKey } from '@/constants/panels';

type Props = {
  onClick: (type: HistoryControlKey) => void;
};

const { undo, redo } = HISTORY;

const HistoryButtons = ({ onClick }: Props) => {
  return (
    <>
      <Styled.Button
        title={createKeyTitle(undo.name, [...undo.modifierKeys, undo.key])}
        onClick={() => onClick(undo.value)}
        data-testid="undo-history-button"
      >
        <Icon name={undo.icon} />
      </Styled.Button>
      <Styled.Button
        title={createKeyTitle(redo.name, [...redo.modifierKeys, redo.key])}
        onClick={() => onClick(redo.value)}
        data-testid="redo-history-button"
      >
        <Icon name={redo.icon} />
      </Styled.Button>
    </>
  );
};

export default memo(HistoryButtons);
