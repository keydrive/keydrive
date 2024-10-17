import { useFileNavigator } from './useFileNavigator';
import { Entry } from '../services/LibrariesService';
import { KeyCode } from './useKeyBind';
import { render } from '../__testutils__/render';
import { fireEvent, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { EntryData } from './useEntries.ts';
import { useState } from 'react';

describe('useFileNavigator', () => {
  it('can navigate using arrow keys', () => {
    const activateEntry = vi.fn();
    const entries: Entry[] = [
      {
        name: 'One',
        parent: '/',
        category: 'Folder',
        modified: '',
        size: 0,
      },
      {
        name: 'Two',
        parent: '/',
        category: 'Folder',
        modified: '',
        size: 0,
      },
      {
        name: 'README.md',
        parent: '/',
        category: 'Document',
        modified: '',
        size: 50,
      },
    ];
    const TestComponent = () => {
      const [selectedEntry, setSelectedEntry] = useState<Entry>();
      useFileNavigator({
        entries,
        activateEntry,
        selectedEntry,
        setSelectedEntry,
      } as unknown as EntryData);

      return (
        <div>
          <span data-testid="selected-name">{selectedEntry?.name}</span>
        </div>
      );
    };

    render(<TestComponent />);
    const nameElement = screen.getByTestId('selected-name');

    expect(nameElement.textContent).toBe('');

    // when nothing is selected and you go up, select the last one
    fireEvent.keyDown(document, { key: KeyCode.ArrowUp });
    expect(nameElement.textContent).toBe('README.md');

    // deselect
    fireEvent.keyDown(document, { key: KeyCode.Escape });
    expect(nameElement.textContent).toBe('');

    // when nothing is selected and you go down, select the first one
    fireEvent.keyDown(document, { key: KeyCode.ArrowDown });
    expect(nameElement.textContent).toBe('One');

    fireEvent.keyDown(document, { key: KeyCode.ArrowDown });
    expect(nameElement.textContent).toBe('Two');

    fireEvent.keyDown(document, { key: KeyCode.ArrowDown });
    expect(nameElement.textContent).toBe('README.md');

    // going down when at the end does nothing
    fireEvent.keyDown(document, { key: KeyCode.ArrowDown });
    expect(nameElement.textContent).toBe('README.md');

    fireEvent.keyDown(document, { key: KeyCode.ArrowUp });
    expect(nameElement.textContent).toBe('Two');

    fireEvent.keyDown(document, { key: KeyCode.ArrowUp });
    expect(nameElement.textContent).toBe('One');

    // going down when at the start does nothing
    fireEvent.keyDown(document, { key: KeyCode.ArrowUp });
    expect(nameElement.textContent).toBe('One');

    fireEvent.keyDown(document, { key: KeyCode.End });
    expect(nameElement.textContent).toBe('README.md');

    fireEvent.keyDown(document, { key: KeyCode.Home });
    expect(nameElement.textContent).toBe('One');

    expect(activateEntry).not.toHaveBeenCalled();
    fireEvent.keyDown(document, { key: KeyCode.ArrowDown });
    fireEvent.keyDown(document, { key: KeyCode.Enter });
    expect(activateEntry).toHaveBeenCalledWith(entries[1]);

    // deselect
    fireEvent.keyDown(document, { key: KeyCode.Escape });
    expect(nameElement.textContent).toBe('');
    // enter does nothing
    expect(activateEntry).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(document, { key: KeyCode.Enter });
    expect(activateEntry).toHaveBeenCalledTimes(1);
  });
});
