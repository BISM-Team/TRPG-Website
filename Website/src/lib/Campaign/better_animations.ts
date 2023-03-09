import type { AnimationConfig, FlipParams } from "svelte/animate";
import { is_function } from "svelte/internal";
import { cubicOut } from "svelte/easing"

export function flip(node: Element, { from, to }: { from: DOMRect, to: DOMRect}, params: FlipParams = {}) : AnimationConfig {
    const style = getComputedStyle(node);
    const [ox, oy] = style.transformOrigin.split(' ').map(parseFloat);
    const dx = (from.left + from.width * ox / to.width) - (to.left + ox);
    const dy = (from.top + from.height * oy / to.height) - (to.top + oy);
    const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
    return {
        delay,
        duration: is_function(duration) ? duration(Math.sqrt(dx * dx + dy * dy)) : duration,
        easing,
        css: (t, u) => {
            const style = getComputedStyle(node);
            const _t = Math.max(parseFloat(style.marginLeft), t);
            const x = u * dx;
            const y = u * dy;
            const sx = _t + u * from.width / to.width;
            const sy = _t + u * from.height / to.height;
            return `transform: translate(${x}px, ${y}px) scale(${sx}, ${sy}); margin-left: ${_t}`;
        }
    };
}