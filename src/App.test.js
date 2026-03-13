import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from './store/store';

jest.mock(
  'react-router-dom',
  () => {
    const React = require('react');
    return {
      __esModule: true,
      BrowserRouter: ({ children }) => <div>{children}</div>,
      Routes: ({ children }) => <div>{children}</div>,
      Route: ({ element }) => element,
      Link: ({ children, to }) => <a href={to}>{children}</a>,
      NavLink: ({ children, to }) => <a href={to}>{children}</a>,
      Outlet: () => <div data-testid="admin-outlet" />,
      useNavigate: () => jest.fn(),
      useLocation: () => ({ pathname: "/" }),
      useParams: () => ({ productId: 'test-product' }),
    };
  },
  { virtual: true }
);

import App from './App';

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: async () => ({ success: true, data: [], pagination: { page: 1, pageSize: 24, total: 0, totalPages: 1 } }),
    })
  );
});

test('renders the storefront catalogue heading', async () => {
  await act(async () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );
  });

  expect(screen.getByText(/modern product catalogue/i)).toBeInTheDocument();
});
