import { useEffect } from 'react';
import { useStore } from '../StorefrontProviders.jsx';

/**
 * "Đã xóa … · Hoàn tác" toast. Rendered inside the cart dialog while it is open
 * (a modal dialog makes everything outside it inert) and in the page otherwise.
 */
export function UndoToast() {
  const { lastRemoved, undoRemove, dismissUndo } = useStore();
  useEffect(() => {
    if (!lastRemoved) return;
    const timer = setTimeout(dismissUndo, 5000);
    return () => clearTimeout(timer);
  }, [lastRemoved, dismissUndo]);
  if (!lastRemoved) return null;
  return (
    <div className="undo-toast" role="status">
      <span>
        Đã xóa <strong>{lastRemoved.name}</strong> khỏi giỏ.
      </span>
      <button type="button" onClick={undoRemove}>
        Hoàn tác
      </button>
    </div>
  );
}
