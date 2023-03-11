import { makeProject } from '@motion-canvas/core/lib';

import rectangles from './scenes/rectangles?scene';


export default makeProject({
  scenes: [rectangles],
  background: '#141414',
});
