import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import SearchBox from '../../../src/ui/molecules/SearchBox';

// ── Helpers ─────────────────────────────────────

const SUGGESTIONS = [
  { placeName: 'Av. Siempre Viva 123, Santiago', coordinates: { lat: -33.45, lng: -70.66 } },
  { placeName: 'Av. Libertador 456, Santiago', coordinates: { lat: -33.42, lng: -70.64 } },
];

function renderSearchBox(props = {}) {
  const onSearch = vi.fn();
  const onSuggest = vi.fn();
  const result = render(
    <SearchBox
      placeholder="Buscá tu dirección..."
      onSearch={onSearch}
      onSuggest={onSuggest}
      suggestions={[]}
      debounceMs={300}
      loading={false}
      {...props}
    />
  );
  return { onSearch, onSuggest, ...result };
}

function typeInInput(value) {
  act(() => {
    fireEvent.change(screen.getByRole('textbox'), { target: { value } });
  });
}

function advanceDebounce(ms = 300) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

// ── Tests ───────────────────────────────────────

describe('SearchBox', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Render ──

  it('renders input with placeholder', () => {
    renderSearchBox({ placeholder: 'Buscar dirección...' });
    expect(screen.getByPlaceholderText('Buscar dirección...')).toBeInTheDocument();
  });

  it('renders search icon', () => {
    const { container } = renderSearchBox();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('updates input value on typing', () => {
    renderSearchBox();
    typeInInput('Av. Siempre');
    expect(screen.getByRole('textbox')).toHaveValue('Av. Siempre');
  });

  // ── Debounce ──

  it('calls onSuggest with debounced value after typing stops', () => {
    const onSuggest = vi.fn();
    renderSearchBox({ onSuggest, suggestions: [] });

    typeInInput('Av. Siempre');

    // Should NOT fire immediately
    expect(onSuggest).not.toHaveBeenCalled();

    advanceDebounce();

    expect(onSuggest).toHaveBeenCalledWith('Av. Siempre');
  });

  it('resets debounce timer when typing again quickly', () => {
    const onSuggest = vi.fn();
    renderSearchBox({ onSuggest, suggestions: [] });

    typeInInput('Av.');
    advanceDebounce(100); // partial advance

    typeInInput('Av. Siempre');
    advanceDebounce(200); // 200ms from last keystroke = not enough

    expect(onSuggest).not.toHaveBeenCalled();

    advanceDebounce(100); // total 300ms from last keystroke

    expect(onSuggest).toHaveBeenCalledTimes(1);
    expect(onSuggest).toHaveBeenCalledWith('Av. Siempre');
  });

  it('does not call onSuggest for empty input', () => {
    const onSuggest = vi.fn();
    renderSearchBox({ onSuggest, suggestions: [] });

    typeInInput('');
    advanceDebounce();

    expect(onSuggest).not.toHaveBeenCalled();
  });

  // ── Suggestions display ──

  it('shows suggestions dropdown when suggestions arrive', () => {
    renderSearchBox({ suggestions: SUGGESTIONS });
    typeInInput('Av.');
    advanceDebounce();

    expect(screen.getByText('Av. Siempre Viva 123, Santiago')).toBeInTheDocument();
    expect(screen.getByText('Av. Libertador 456, Santiago')).toBeInTheDocument();
  });

  it('does not show dropdown when suggestions array is empty', () => {
    renderSearchBox({ suggestions: [] });
    typeInInput('Av.');
    advanceDebounce();

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  // ── Suggestion click ──

  it('calls onSearch when clicking a suggestion', () => {
    const { onSearch } = renderSearchBox({ suggestions: SUGGESTIONS });

    typeInInput('Av.');
    advanceDebounce();

    fireEvent.click(screen.getByText('Av. Siempre Viva 123, Santiago'));

    expect(onSearch).toHaveBeenCalledWith(
      'Av. Siempre Viva 123, Santiago',
      SUGGESTIONS[0].coordinates
    );
  });

  it('closes dropdown after selecting a suggestion', () => {
    renderSearchBox({ suggestions: SUGGESTIONS });

    typeInInput('Av.');
    advanceDebounce();

    fireEvent.click(screen.getByText('Av. Siempre Viva 123, Santiago'));

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  // ── Keyboard navigation ──

  it('highlights first suggestion on ArrowDown', () => {
    renderSearchBox({ suggestions: SUGGESTIONS });

    typeInInput('Av.');
    advanceDebounce();

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    const items = screen.getAllByRole('listitem');
    expect(items[0].className).toContain('bg-primary/20');
  });

  it('selects highlighted suggestion on Enter', () => {
    const { onSearch } = renderSearchBox({ suggestions: SUGGESTIONS });

    typeInInput('Av.');
    advanceDebounce();

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onSearch).toHaveBeenCalledWith(
      SUGGESTIONS[0].placeName,
      SUGGESTIONS[0].coordinates
    );
  });

  it('closes dropdown on Escape', () => {
    renderSearchBox({ suggestions: SUGGESTIONS });

    typeInInput('Av.');
    advanceDebounce();

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  // ── Clear button (shows after debounce ends) ──

  it('shows clear button when input has value and debounce is done', () => {
    renderSearchBox();
    typeInInput('Av.');
    advanceDebounce(); // isDebouncing → false

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('clears input on clear button click', () => {
    renderSearchBox();

    typeInInput('Av. Siempre');
    advanceDebounce();

    const input = screen.getByRole('textbox');
    fireEvent.click(screen.getByRole('button'));

    expect(input).toHaveValue('');
  });

  // ── Loading spinner (during debounce) ──

  it('shows spinner during debounce', () => {
    renderSearchBox();
    typeInInput('Av.');

    // isDebouncing is true because setTimeout hasn't fired yet
    expect(screen.getByTestId('search-spinner')).toBeInTheDocument();
  });

  it('hides spinner and shows clear button after debounce', () => {
    renderSearchBox();
    typeInInput('Av.');
    advanceDebounce();

    expect(screen.queryByTestId('search-spinner')).not.toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  // ── Click outside ──

  it('closes dropdown when clicking outside', () => {
    render(
      <div>
        <span data-testid="outside">Click fuera</span>
        <SearchBox
          onSearch={vi.fn()}
          onSuggest={vi.fn()}
          suggestions={SUGGESTIONS}
          loading={false}
        />
      </div>
    );

    typeInInput('Av.');
    advanceDebounce();

    expect(screen.getByText('Av. Siempre Viva 123, Santiago')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId('outside'));

    expect(screen.queryByText('Av. Siempre Viva 123, Santiago')).not.toBeInTheDocument();
  });
});
