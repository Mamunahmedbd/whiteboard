import { styled } from 'shared';

export const Container = styled('div', {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 0 0 $2',
  borderRadius: '$2',
  overflow: 'hidden',
  border: '0.5px solid gray',
  '&:hover': {
    borderColor: '$primary-dark',
  },
  '&:active': {
    borderColor: '$primary-dark',
  },
});
