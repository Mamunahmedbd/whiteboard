import { memo } from 'react';
import Button from '@/components/Elements/Button/Button';
import { Link } from 'react-router-dom';

const CreateNewDiagramPanel = () => {
  return (
    <Link to="/">
      <Button color="primary" size="sm">
        Create new
      </Button>
    </Link>
  );
};

export default memo(CreateNewDiagramPanel);
