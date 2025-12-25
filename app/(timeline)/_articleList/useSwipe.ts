import { useEventListener, useResponsive } from "ahooks";

interface Options {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

let startX = 0;
export default function useSwipe(options: Options) {
  const responsive = useResponsive();

  useEventListener(
    "touchstart",
    (e) => {
      startX = e.touches[0].clientX;
    },
    {
      enable: responsive?.xs || responsive?.sm,
    }
  );

  useEventListener(
    "touchend",
    (e) => {
      const endX = e.changedTouches[0].clientX;
      const deltaX = endX - startX;

      if (deltaX > 100) {
        options?.onSwipeRight?.();
      } else if (deltaX < -50) {
        options?.onSwipeLeft?.();
      }
    },
    {
      enable: responsive?.xs || responsive?.sm,
    }
  );
}
