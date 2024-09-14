import { memo, useState } from 'react';
import { useAppSelector, useAppStore } from '@/stores/hooks';
import { IconBxSave } from '@/components/Elements/Icon/Icon';
import * as Styled from './SaveDiagram.styled';
import { useModal } from '@/contexts/modal';
import SaveDiagramForm from './Form';
import { useParams } from 'react-router-dom';
import api from '@/services/api';
import { useNotifications } from '@/contexts/notifications';
import { selectPresentHistory } from '@/services/canvas/slice';

const SaveDiagramPanel = () => {
  const [loading, setLoading] = useState(false);
  // const store = useAppStore();
  const { openModal, closeModal } = useModal();
  const { diagramId } = useParams();
  const { addNotification } = useNotifications();
  const state = useAppSelector(selectPresentHistory);

  const handleSaveDiagram = () => {
    openModal({
      title: 'Save diagram',
      description: 'Save diagram',
      element: <SaveDiagramForm />,
    });
  };

  const handleUpdateDiagram = async () => {
    try {
      setLoading(true);
      const { data } = await api.updateDiagram(diagramId as string, state);

      const id = data?.data?.id;
      if (!id) {
        addNotification({
          title: 'Could not updated diagram',
          description: 'Failed to updated diagram',
          type: 'error',
        });
      }

      closeModal();
      addNotification({
        title: 'Updated diagram',
        description: 'Diagram Updated successfully',
        type: 'success',
      });
    } catch (error) {
      addNotification({
        title: 'Could not updated diagram',
        description: 'Failed to updated diagram',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Styled.SaveButton
      disabled={loading}
      onClick={!diagramId ? handleSaveDiagram : handleUpdateDiagram}
      color="primary"
      size="sm"
    >
      <IconBxSave />
      {loading ? 'Saving...' : 'Save'}
    </Styled.SaveButton>
  );
};

export default memo(SaveDiagramPanel);
