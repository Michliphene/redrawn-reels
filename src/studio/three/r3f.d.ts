// React Three Fiber 8 declares its elements (<mesh>, <group>…) on the global JSX namespace, which
// @types/react 19 no longer reads. Re-declare them where the new JSX runtime looks.
import type { ThreeElements } from '@react-three/fiber';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
