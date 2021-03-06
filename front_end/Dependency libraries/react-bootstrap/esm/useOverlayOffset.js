import { useMemo, useRef } from 'react';
import hasClass from 'dom-helpers/hasClass';
import { useBootstrapPrefix } from './ThemeProvider';
import Popover from './Popover'; // This is meant for internal use.
// This applies a custom offset to the overlay if it's a popover.

export default function useOverlayOffset() {
  const overlayRef = useRef(null);
  const popoverClass = useBootstrapPrefix(undefined, 'popover');
  const offset = useMemo(() => ({
    name: 'offset',
    options: {
      offset: () => {
        if (overlayRef.current && hasClass(overlayRef.current, popoverClass)) {
          return Popover.POPPER_OFFSET;
        }

        return [0, 0];
      }
    }
  }), [popoverClass]);
  return [overlayRef, [offset]];
}