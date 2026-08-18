import { useState, useEffect, useCallback } from "react";

export interface FocusState {
  railIndex: number;
  itemIndex: number;
}

export interface RailData {
  id: string;
  count: number;
  onSelect: (itemIndex: number) => void;
}

export function useFocusNavigation(rails: RailData[], isEnabled: boolean = true) {
  const [focus, setFocus] = useState<FocusState>({ railIndex: 0, itemIndex: 0 });
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);

  // Reset focus bounds if rails change or count changes
  useEffect(() => {
    setFocus((prev) => {
      const validRailIdx = Math.min(prev.railIndex, Math.max(0, rails.length - 1));
      const currentRail = rails[validRailIdx];
      const validItemIdx = currentRail ? Math.min(prev.itemIndex, Math.max(0, currentRail.count - 1)) : 0;
      return { railIndex: validRailIdx, itemIndex: validItemIdx };
    });
  }, [rails]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isEnabled || rails.length === 0) return;

      // Don't intercept if user is typing in an input or textarea or modal
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      const { railIndex, itemIndex } = focus;
      const currentRail = rails[railIndex];

      switch (e.key) {
        case "ArrowRight": {
          if (!currentRail || currentRail.count === 0) break;
          e.preventDefault();
          setIsKeyboardActive(true);
          if (itemIndex < currentRail.count - 1) {
            setFocus({ railIndex, itemIndex: itemIndex + 1 });
          }
          break;
        }

        case "ArrowLeft": {
          if (!currentRail || currentRail.count === 0) break;
          e.preventDefault();
          setIsKeyboardActive(true);
          if (itemIndex > 0) {
            setFocus({ railIndex, itemIndex: itemIndex - 1 });
          }
          break;
        }

        case "ArrowDown": {
          e.preventDefault();
          setIsKeyboardActive(true);
          if (railIndex < rails.length - 1) {
            const nextRail = rails[railIndex + 1];
            const targetItemIndex = nextRail ? Math.min(itemIndex, Math.max(0, nextRail.count - 1)) : 0;
            setFocus({ railIndex: railIndex + 1, itemIndex: targetItemIndex });
          }
          break;
        }

        case "ArrowUp": {
          e.preventDefault();
          setIsKeyboardActive(true);
          if (railIndex > 0) {
            const prevRail = rails[railIndex - 1];
            const targetItemIndex = prevRail ? Math.min(itemIndex, Math.max(0, prevRail.count - 1)) : 0;
            setFocus({ railIndex: railIndex - 1, itemIndex: targetItemIndex });
          }
          break;
        }

        case "Enter":
        case " ": {
          if (currentRail && currentRail.count > 0 && itemIndex < currentRail.count) {
            e.preventDefault();
            currentRail.onSelect(itemIndex);
          }
          break;
        }

        default:
          break;
      }
    },
    [isEnabled, rails, focus]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Turn off keyboard highlight state if user uses mouse pointer
  useEffect(() => {
    const handleMouseMove = () => {
      if (isKeyboardActive) {
        setIsKeyboardActive(false);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isKeyboardActive]);

  return {
    focus,
    setFocus,
    isKeyboardActive,
  };
}
