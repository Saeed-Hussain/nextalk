import { useRef, useCallback } from "react";

// Hook that triggers `onLongPress` after `delay` ms of pointer-down
// without movement. Falls back to right-click on desktop.
export const useLongPress = (onLongPress, { delay = 450 } = {}) => {
  const timer = useRef(null);
  const triggered = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  const start = useCallback(
    (e) => {
      triggered.current = false;
      const point = e.touches?.[0] || e;
      startPos.current = { x: point.clientX, y: point.clientY };
      timer.current = setTimeout(() => {
        triggered.current = true;
        onLongPress(e);
      }, delay);
    },
    [onLongPress, delay]
  );

  const move = useCallback((e) => {
    const point = e.touches?.[0] || e;
    const dx = point.clientX - startPos.current.x;
    const dy = point.clientY - startPos.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > 8) {
      clearTimeout(timer.current);
    }
  }, []);

  const cancel = useCallback(() => {
    clearTimeout(timer.current);
  }, []);

  const onContextMenu = useCallback(
    (e) => {
      e.preventDefault();
      onLongPress(e);
    },
    [onLongPress]
  );

  return {
    onPointerDown: start,
    onPointerMove: move,
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onContextMenu,
    didTriggerLongPress: () => triggered.current,
  };
};
