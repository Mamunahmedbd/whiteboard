import * as DialogPrimitive from '@radix-ui/react-dialog';
import { styled } from 'shared';

export const Overlay = styled(DialogPrimitive.Overlay, {
  backdropFilter: 'blur(4px)',
  position: 'fixed',
  inset: 0,
  zIndex: 1,
  opacity: 0,
  transition: 'opacity $normal',
  '&[data-state="open"]': {
    opacity: 1,
  },
});

export const Content = styled(DialogPrimitive.Content, {
  backgroundColor: '$bg',
  borderRadius: '$2',
  boxShadow: '$sm',
  position: 'fixed',
  top: '50%',
  left: '50%',
  zIndex: 1,
  width: '90vw',
  maxWidth: '450px',
  maxHeight: '85vh',
  padding: '$6',
  opacity: 0,
  transform: 'translate(-50%, -48%) scale(0.96)',
  transition: 'opacity $normal, transform $normal',
  '&[data-state="open"]': {
    opacity: 1,
    transform: 'translate(-50%, -50%) scale(1)',
  },
});

export const Element = styled(DialogPrimitive.DialogContent, {
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
  padding: '$4 0',
});

export const Close = styled(DialogPrimitive.Close, {
  position: 'absolute',
  right: '$3',
  top: '$3',
});

export const Title = styled(DialogPrimitive.Title, {
  fontSize: '$3',
  fontWeight: 'bold',
  paddingBottom: '$2',
});

export const Description = styled(DialogPrimitive.Description, {
  fontSize: '$2',
});
