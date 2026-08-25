import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HelpHint from '../../../src/ui/molecules/HelpHint';

const HINT_TEXT = '¿Cuántos km vas a recorrer en este envío?';

function renderHelpHint() {
  return render(<HelpHint text={HINT_TEXT} />);
}

describe('HelpHint', () => {
  it('renders the info button', () => {
    renderHelpHint();
    expect(screen.getByLabelText('Más información')).toBeInTheDocument();
  });

  it('shows the popover when the button is clicked', () => {
    renderHelpHint();
    fireEvent.click(screen.getByLabelText('Más información'));
    expect(screen.getByRole('dialog')).toHaveTextContent(HINT_TEXT);
  });

  it('hides the popover when the close button is clicked', () => {
    renderHelpHint();
    fireEvent.click(screen.getByLabelText('Más información'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Cerrar'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('toggles the popover on repeated clicks', () => {
    renderHelpHint();
    const button = screen.getByLabelText('Más información');

    fireEvent.click(button);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
