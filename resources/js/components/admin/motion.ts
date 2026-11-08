/**
 * Shared motion tokens for the admin portal. A dashboard stays crisp:
 * short, ease-out, transform and opacity only.
 */

/**
 * Press feedback for clickable things that are not <Button> (which has its
 * own scale on :active), such as the sort header in the consents table.
 */
export const PRESSABLE =
    'transition-[transform,background-color,color,box-shadow,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] motion-reduce:active:scale-100';

/**
 * Popover entry: scale from the trigger (Radix sets transform-origin),
 * strong ease-out, under 200ms. Reduced motion keeps the fade only.
 */
export const POPOVER_MOTION =
    'duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] data-closed:duration-100 motion-reduce:zoom-in-100 motion-reduce:zoom-out-100 motion-reduce:slide-in-from-top-0 motion-reduce:slide-in-from-bottom-0';

/** Wait this long before showing a loading state, so fast reloads don't flash. */
export const BUSY_DELAY_MS = 200;
