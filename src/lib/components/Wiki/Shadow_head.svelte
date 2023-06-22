<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"/>

<style lang="postcss">
  :global(.btn) {
      font-size: 1rem/* 16px */;
      line-height: 1.5rem/* 24px */;
      padding-left: 1.25rem/* 20px */;
      padding-right: 1.25rem/* 20px */;
      padding-top: 9px;
      padding-bottom: 9px;
      white-space: nowrap;
      text-align: center;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition-property: all;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
      border-radius: var(--theme-rounded-base);
  }
  :global(.btn) > :not([hidden]) ~ :not([hidden]) {
      --tw-space-x-reverse: 0;
      margin-right: calc(0.5rem * var(--tw-space-x-reverse));
      margin-left: calc(0.5rem * calc(1 - var(--tw-space-x-reverse)));
  }
  :global(.btn):hover {
      --tw-brightness: brightness(1.15);
      filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
  }
  :global(.btn):active {
      --tw-scale-x: 95%;
      --tw-scale-y: 95%;
      transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
      --tw-brightness: brightness(.9);
      filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
  }

  :global(.material-symbols-outlined) {
    color: inherit;
  }
</style>