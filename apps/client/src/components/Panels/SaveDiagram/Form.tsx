import { useState } from 'react';
import { FormContainer, InputFieldContainer } from './Form.styled';
import Button from '@/components/Elements/Button/Button';
import { Spinner } from '@/components/Elements/Icon/Icon';
import api from '@/services/api';
import { useAppStore } from '@/stores/hooks';
import { useModal } from '@/contexts/modal';
import { useNotifications } from '@/contexts/notifications';
import { useNavigate } from 'react-router-dom';

export default function SaveDiagramForm() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { closeModal } = useModal();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  const store = useAppStore();
  const state = store.getState().canvas.present;

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setLoading(true);
      const { data } = await api.createDiagram({
        ...state,
        name: name,
      });

      const id = data?.data?._id;
      if (!id) {
        addNotification({
          title: 'Could not save diagram',
          description: 'Failed to save diagram',
          type: 'error',
        });
      }

      closeModal();
      addNotification({
        title: 'Save diagram',
        description: 'Diagram saved successfully',
        type: 'success',
      });
      navigate(`/diagram/${id}`);
    } catch (error) {
      addNotification({
        title: 'Could not save diagram',
        description: 'Failed to save diagram',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <FormContainer onSubmit={handleSave}>
      <InputFieldContainer
        id="diagram-name"
        type="text"
        placeholder="Diagram name"
        onChange={(e) => setName(e.target.value)}
        value={name}
        required
      />
      <Button
        type="submit"
        color="primary"
        size="sm"
        data-testid="save-diagram-button"
        style={{ gap: '0.25rem' }}
      >
        {loading && <Spinner />}
        Save
      </Button>
    </FormContainer>
  );
}
