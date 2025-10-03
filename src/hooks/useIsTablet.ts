import { useMediaQuery } from '@uidotdev/usehooks';

function useIsTablet() {
  return useMediaQuery('only screen and (min-width:768px)');
}

export default useIsTablet;
