<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import type { Transform } from '@annotorious/annotorious';
  import { boundsFromPoints, ShapeType, type Polygon } from '@annotorious/annotorious';

  const dispatch = createEventDispatcher<{ create: Polygon }>();

  /** Props **/
  export let addEventListener: (type: string, fn: EventListener, capture?: boolean) => void;
  export let transform: Transform;
  export let viewportScale = number;

  let points: [number, number][] = [];
  let isDrawing = false;

  const onPointerDown = (event: Event) => {
    const evt = event as PointerEvent;
    const point = transform.elementToImage(evt.offsetX, evt.offsetY);

    if (!isDrawing) {
      // Start drawing
      points = [point]; // Start a new path
      isDrawing = true;
    } else {
      // Stop drawing and finalize the shape
      isDrawing = false;

      if (points.length > 1) {
        const reversedPoints = [...points].reverse();
        const modifiedPoints = [...points, ...reversedPoints];
        const p = points;
        const shape: Polygon = {
          type: ShapeType.POLYGON,
          geometry: {
            bounds: boundsFromPoints(p),
            points: modifiedPoints,
          }
        };

        dispatch('create', shape);
      }

      points = []; // Clear points after finalizing the shape
    }
  };

  const onPointerMove = (event: Event) => {
    if (!isDrawing) return;

    const evt = event as PointerEvent;
    const point = transform.elementToImage(evt.offsetX, evt.offsetY);
    points = [...points, point]; // Continuously add points to the path
  };

  onMount(() => {
    addEventListener('pointerdown', onPointerDown, true); // Use pointerdown to toggle drawing state
    addEventListener('pointermove', onPointerMove, true);
  });
</script>

<g class="a9s-annotation">
  {#if points.length > 0}
    <polyline
      class="a9s-freehand-path"
      style={`stroke-width: ${4 / viewportScale}px;`}
      points={points.map(([x, y]) => `${x},${y}`).join(' ')} />
  {/if}
</g>
