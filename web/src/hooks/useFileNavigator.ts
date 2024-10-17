import { useCallback, useEffect, useState } from 'react';
import { KeyCode, useKeyBind } from './useKeyBind';
import { Entry } from '../services/LibrariesService';
import { useLocation } from 'react-router-dom';

export const useFileNavigator = (
  entries: Entry[] | undefined,
  onActivateEntry: (entry: Entry) => void,
): {
  selectedEntry: Entry | undefined;
  setSelectedEntry: (entry: Entry | undefined) => void;
} => {
  const location = useLocation();
  const hash = decodeURIComponent(
    location.hash ? location.hash.substring(1) : '',
  );

  const [selectedEntry, setSelectedEntry] = useState<Entry>();

  useEffect(() => {
    setSelectedEntry(entries?.find((e) => e.name === hash));
  }, [entries, hash]);

  const shiftSelectToFirst = useCallback(() => {
    if (entries && entries.length > 0) {
      setSelectedEntry(entries[0]);
    }
  }, [entries]);

  const shiftSelectToLast = useCallback(() => {
    if (entries && entries.length > 0) {
      setSelectedEntry(entries[entries.length - 1]);
    }
  }, [entries]);

  const shiftSelect = useCallback(
    (delta: -1 | 1) => {
      if (!entries || entries.length === 0) {
        return;
      }
      if (selectedEntry) {
        const currentIndex = entries.findIndex(
          (e) => e.name === selectedEntry.name,
        );
        const desiredIndex = Math.min(
          Math.max(currentIndex + delta, 0),
          entries.length - 1,
        );
        setSelectedEntry(entries[desiredIndex]);
      } else if (delta === 1) {
        // we have no selection so we select the top item to be able to scroll down
        shiftSelectToFirst();
      } else if (delta === -1) {
        // we have no selection so we select the bottom item to be able to scroll up
        shiftSelectToLast();
      }
    },
    [entries, selectedEntry, shiftSelectToFirst, shiftSelectToLast],
  );

  useKeyBind(KeyCode.Enter, () => {
    if (selectedEntry) {
      onActivateEntry(selectedEntry);
    }
  });
  useKeyBind(KeyCode.Escape, () => {
    setSelectedEntry(undefined);
  });
  useKeyBind(KeyCode.ArrowUp, () => {
    shiftSelect(-1);
  });
  useKeyBind(KeyCode.ArrowDown, () => {
    shiftSelect(+1);
  });
  useKeyBind(KeyCode.Home, () => {
    shiftSelectToFirst();
  });
  useKeyBind(KeyCode.End, () => {
    shiftSelectToLast();
  });

  return { selectedEntry, setSelectedEntry };
};
