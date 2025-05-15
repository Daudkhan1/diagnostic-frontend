import { ShapeType, type ImageAnnotator } from '@annotorious/annotorious';
import { FreeHandEditor, RubberbandFreeHand } from './ellipse';
import type { SvelteComponent } from 'svelte';

export const mountPlugin = (
  anno: ImageAnnotator
) => {
  anno.registerDrawingTool('freehand', RubberbandFreeHand as typeof SvelteComponent);
  anno.registerShapeEditor(ShapeType.POLYGON, FreeHandEditor as typeof SvelteComponent);
};
