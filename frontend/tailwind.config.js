/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [
    function ({ addBase, addUtilities }) {
      addBase({
        'button,input:where([type="button"]),input:where([type="reset"]),input:where([type="submit"])': {
          'appearance': 'button',
          '-webkit-appearance': 'button',
          'background-color': 'transparent',
          'background-image': 'none',
        },
        '[type="search"]': {
          'appearance': 'textfield',
          '-webkit-appearance': 'textfield',
          'outline-offset': '-2px',
        },
        '::-webkit-search-decoration': {
          'appearance': 'none',
          '-webkit-appearance': 'none',
        },
        '::-webkit-file-upload-button': {
          'appearance': 'button',
          '-webkit-appearance': 'button',
          'font': 'inherit',
        },
        'progress': {
          // vertical-align: baseline is the browser default and can be removed
          // when not overridden elsewhere.
        },
        'img,svg,video,canvas,audio,iframe,embed,object': {
          'display': 'block',
          // vertical-align is ignored on block-level elements, so remove it.
        },
      });
    },
  ],
};
