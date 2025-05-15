<script lang="ts">
  import type { Shape } from '@annotorious/annotorious';
  import type { Transform } from '@annotorious/annotorious';
  import { Editor } from '@annotorious/annotorious';

  /** Props */
  export let shape: Shape;
  export let computedStyle: string | undefined;
  export let transform: Transform;
  export let viewportScale: number = 1;

  $: path = shape.geometry.points.map(([x, y]) => `${x},${y}`).join(' ');

  const editor = (shape: Shape, _handle: string, delta: [number, number]) => {
    // Update all points in the path by delta
    const points = shape.geometry.points.map(([x, y]) => [x + delta[0], y + delta[1]]);
    return {
      ...shape,
      geometry: { points }
    };
  };
</script>

<Editor
  shape={shape}
  transform={transform}
  editor={editor}
  on:change
  on:grab
  on:release
  let:grab={grab}>

  <polyline
      class="a9s-outer"
      style={computedStyle  ? 'display:none;' : undefined}
      on:pointerdown={grab('SHAPE')}
      points={path} />

  <polyline
    class="a9s-inner a9s-shape-handle"
    style={computedStyle}
    on:pointerdown={grab('SHAPE')}
    points={path} />
</Editor>
