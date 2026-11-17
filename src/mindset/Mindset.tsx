import React from 'react';
import { Mindset3D, type MindsetProps } from './Mindset3D';

/**
 * Entry point of the UNGRADED series. There is one art direction (DA 2, a 3D set), so there is no flat fallback:
 * a machine without WebGL fails loudly at render time instead of publishing a degraded reel.
 */
export const Mindset: React.FC<MindsetProps & { da?: number; webgl?: boolean }> = (props) => <Mindset3D {...props} />;
