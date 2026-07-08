import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the store layout on the home route', async () => {
  render(<App />);
  expect(screen.getAllByText(/DESTROY YOURSELF/i)[0]).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /tienda/i })[0]).toBeInTheDocument();

  // Wait for HomePage's product/category fetch to settle so no state
  // update happens after the test finishes (avoids act() warnings).
  await screen.findByText(/playera destruida/i);
});
