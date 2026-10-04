import { useBreakpoints, breakpointsTailwind } from '@vueuse/core';

export function useResponsiveModal() {
  const breakpoints = useBreakpoints(breakpointsTailwind);
  const isMobile = breakpoints.smaller('md');

  return { isMobile };
}
