import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import { globalStyle } from './global-style';
import { AppProvider } from './providers/app';
import ErrorPage from './routes/error-page';
import Diagram from './routes/diagram';
import InitialPage from './routes/initial-page';

globalStyle();

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <InitialPage /> },
      {
        path: 'diagram/:diagramId',
        element: <Diagram />,
      },
    ],
  },
  // not found
  { path: '*', element: <ErrorPage /> },
]);

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  </React.StrictMode>,
);
