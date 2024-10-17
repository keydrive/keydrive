import { Modal } from './Modal';
import { render } from '../__testutils__/render';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

describe('Modal', () => {
  it('closes when pressing escape', async () => {
    const onClose = vi.fn();
    await render(<Modal onClose={onClose} title="Close me!" />);

    fireEvent.keyDown(screen.getByText('Close me!'), { key: 'Escape' });
    await waitFor(() => expect(onClose).toBeCalled());
  });

  it('closes when clicking the close icon', async () => {
    const onClose = vi.fn();
    await render(<Modal onClose={onClose} title="Close me!" />);

    userEvent.click(screen.getByRole('close'));
    await waitFor(() => expect(onClose).toBeCalled());
  });
});
