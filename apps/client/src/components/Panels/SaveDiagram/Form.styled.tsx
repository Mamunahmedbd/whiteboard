import { styled } from 'shared';

// Styled components
export const FormContainer = styled('form', {
  display: 'flex',
  flexDirection: 'column',
  padding: '20px',
  borderRadius: '8px',
  width: '100%',
  margin: '10px auto',
  zIndex: 9999,
});

export const InputFieldContainer = styled('input', {
  padding: '10px',
  margin: '10px 0',
  width: '100%',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '14px',
  '&:focus-within': {
    borderColor: '#007bff',
    outline: 'none',
  },
});
