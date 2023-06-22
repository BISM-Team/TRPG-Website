import type { AnimationConfig, FlipParams } from "svelte/animate";
import { cubicOut } from "svelte/easing"

export function flip(node: Element, { from, to }: { from: DOMRect, to: DOMRect}, params: FlipParams = {}) : AnimationConfig {
    const style = getComputedStyle(node);
    const transform = style.transform === 'none' ? '' : style.transform;
    const initial_time = parseFloat(style.getPropertyValue('--anim-time') || '0.0');
    const [ox, oy] = style.transformOrigin.split(' ').map(parseFloat);
    const dx = (from.left + from.width * ox / to.width) - (to.left + ox);
    const dy = (from.top + from.height * oy / to.height) - (to.top + oy);
    const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
    return {
        delay,
        duration: typeof duration === "function" ? duration(Math.sqrt(dx * dx + dy * dy)) : duration,
        easing,
        css: (t, u) => {
            const current_time = initial_time + t;
            const current_u = u - initial_time;
            const x = current_u * dx;
            const y = current_u * dy;
            const sx = current_time + current_u * from.width / to.width;
            const sy = current_time + current_u * from.height / to.height;
            return `transform: ${transform} translate(${x}px, ${y}px) scale(${sx}, ${sy}); --anim-time: ${current_time}`;
        }
    };
}