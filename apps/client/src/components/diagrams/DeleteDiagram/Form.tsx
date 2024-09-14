import { useState } from 'react';
import { FormContainer } from './Form.styled';
import Button from '@/components/Elements/Button/Button';
import { Spinner } from '@/components/Elements/Icon/Icon';
import api from '@/services/api';
import { useModal } from '@/contexts/modal';
import { useNotifications } from '@/contexts/notifications';
import { useNavigate, useParams } from 'react-router-dom';

type IProps = {
  id: string;
  setReload: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function DeleteDiagramForm({ id, setReload }: IProps) {
  const [loading, setLoading] = useState(false);
  const { closeModal } = useModal();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const { diagramId } = useParams();

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setLoading(true);
      const { data } = await api.deleteDiagram(id);

      const responseId = data?.data;
      if (!responseId) {
        addNotification({
          title: 'Could not delete diagram',
          description: 'Failed to delete diagram',
          type: 'error',
        });
      }

      closeModal();
      addNotification({
        title: 'Delete diagram',
        description: 'Diagram deleted successfully',
        type: 'success',
      });
      setReload((prev) => !prev);
      if (diagramId === id) {
        navigate('/');
      }
    } catch (error) {
      addNotification({
        title: 'Could not delete diagram',
        description: 'Failed to delete diagram',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    closeModal();
  };

  return (
    <FormContainer onSubmit={handleSave}>
      <Button
        color="primary"
        size="sm"
        data-testid="delete-no-diagram-button"
        onClick={handleClose}
      >
        No
      </Button>
      <Button
        color="primary"
        type="submit"
        size="sm"
        data-testid="delete-yes-diagram-button"
        style={{ gap: '0.25rem' }}
      >
        {loading && <Spinner />}
        Yes
      </Button>
    </FormContainer>
  );
}
