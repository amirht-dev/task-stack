import { useMediaQuery } from '@uidotdev/usehooks';

function useIsDesktop() {
  return useMediaQuery('only screen and (min-width:1024px)');
}

export default useIsDesktop;
