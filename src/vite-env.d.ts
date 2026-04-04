/// <reference types="vite/client" />

// KiCanvas web component (loaded via CDN in index.html)
declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      "kicanvas-embed": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        controls?: string;
      };
    }
  }
}
