import Icon from '@/components/Elements/Icon/Icon';
import * as Styled from './DiagramItemCard.styled';
import Button from '@/components/Elements/Button/Button';
import DeleteDiagramForm from '../DeleteDiagram/Form';
import { useModal } from '@/contexts/modal';
import { NavLink, useParams } from 'react-router-dom';

type Props = {
  name: string;
  id: string;
  setReload: React.Dispatch<React.SetStateAction<boolean>>;
};

const DiagramItemCard = ({ name, id, setReload }: Props) => {
  const { openModal } = useModal();
  const { diagramId } = useParams();

  const handleDeleteDiagram = () => {
    openModal({
      title: 'Delete diagram',
      description: 'Are you sure you want to delete this diagram?',
      element: <DeleteDiagramForm id={id} setReload={setReload} />,
    });
  };

  return (
    <Styled.Container
      style={diagramId === id ? { border: '2px solid #43A047' } : {}}
      data-testid="diagram-item"
    >
      <NavLink to={`/diagram/${id}`}>
        <span
          style={{
            fontSize: '0.875rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          {name}{' '}
        </span>
      </NavLink>
      <Button
        color="danger"
        size="sm"
        squared
        data-testid="remove-diagram-items-button"
        onClick={(e) => {
          e.stopPropagation(); // Prevent navigation
          handleDeleteDiagram(); // Handle the deletion
        }}
      >
        <Icon size="sm" name="trash" />
      </Button>
    </Styled.Container>
  );
};

export default DiagramItemCard;
