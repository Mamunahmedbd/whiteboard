import { Provider as StoreProvider } from 'react-redux';
import { NotificationsProvider } from '@/contexts/notifications';
import { store } from '@/stores/store';
import { ThemeProvider } from '@/contexts/theme';

type Props = {
  children: React.ReactNode;
};

export const AppProvider = ({ children }: Props) => {
  return (
    <StoreProvider store={store}>
      <NotificationsProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </NotificationsProvider>
    </StoreProvider>
  );
};
