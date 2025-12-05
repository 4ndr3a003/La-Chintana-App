/**
 * Disables zooming functionality in the browser.
 * This includes:
 * - Ctrl + Scroll (Mouse wheel)
 * - Ctrl + +/-/0 (Keyboard shortcuts)
 * - Pinch-to-zoom (Touch gestures)
 * - Double-tap to zoom (Touch gestures)
 */
export const disableZoom = () => {
    // Prevent Ctrl + Scroll
    window.addEventListener(
        'wheel',
        (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
            }
        },
        { passive: false }
    );

    // Prevent Ctrl + Keydown (+, -, 0)
    window.addEventListener('keydown', (e) => {
        if (
            e.ctrlKey &&
            (e.key === '+' ||
                e.key === '-' ||
                e.key === '0' ||
                e.key === '=' ||
                e.keyCode === 187 || // +
                e.keyCode === 189 || // -
                e.keyCode === 48) // 0
        ) {
            e.preventDefault();
        }
    });

    // Prevent Gesture Zoom (Safari)
    document.addEventListener(
        'gesturestart',
        (e) => {
            e.preventDefault();
        },
        { passive: false }
    );

    document.addEventListener(
        'gesturechange',
        (e) => {
            e.preventDefault();
        },
        { passive: false }
    );

    document.addEventListener(
        'gestureend',
        (e) => {
            e.preventDefault();
        },
        { passive: false }
    );
};
