const colors = require('tailwindcss/colors');
const daisyui = require('daisyui');
const typography = require('@tailwindcss/typography');
const forms = require('@tailwindcss/forms');
const heroPatterns = require('tailwind-heropatterns');

module.exports = {
	darkMode: 'class',
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			cursor: {
				grab: 'grab'
			},
			colors: {
				dark: {
					50: '#4a4a4a',
					100: '#3c3c3c',
					200: '#323232',
					300: '#2d2d2d',
					400: '#222222',
					500: '#1f1f1f',
					600: '#1c1c1e',
					700: '#1b1b1b',
					800: '#181818',
					900: '#0f0f0f'
				},
				light: {
					50: '#fdfdfd',
					100: '#fcfcfc',
					200: '#fafafa',
					300: '#f8f9fa',
					400: '#f6f6f6',
					500: '#f2f2f2',
					600: '#f1f3f5',
					700: '#e9ecef',
					800: '#dee2e6',
					900: '#dde1e3'
				}
			},
			typography: {
				DEFAULT: {
					css: {
						color: '#000000',
						a: {
							color: '#60A5fA',
							textDecoration: 'underline',
							'&:hover': {
								color: '#1D4ED8'
							}
						},
						h1: {
							color: '#60A5fA',
							fontWeight: 200
						},
						h2: {
							color: '#60A5fA',
							fontWeight: 200
						},
						h3: {
							color: '#60A5fA',
							fontWeight: 200
						},
						h4: {
							color: '#60A5fA',
							fontWeight: 200
						},
						h5: {
							color: '#60A5fA',
							fontWeight: 200
						},
						h6: {
							color: '#60A5fA',
							fontWeight: 200
						}
					}
				},
				dark: {
					css: {
						color: '#FAFAFA',
						a: {
							color: '#60A5fA',
							textDecoration: 'underline',
							'&:hover': {
								color: '#1D4ED8'
							}
						},
						h1: {
							color: '#60A5fA',
							fontWeight: 200
						},
						h2: {
							color: '#60A5fA',
							fontWeight: 200
						},
						h3: {
							color: '#60A5fA',
							fontWeight: 200
						},
						h4: {
							color: '#60A5fA',
							fontWeight: 200
						},
						h5: {
							color: '#60A5fA',
							fontWeight: 200
						},
						h6: {
							color: '#60A5fA',
							fontWeight: 200
						}
					}
				}
			}
		},
		boxShadow: {
			animate:
				'0.5px 0.5px rgba(255,255,255,1), 1.5px 1.5px rgba(255,255,255,1), 2.5px 2.5px rgba(255,255,255,1), 3.5px 3.5px rgba(255,255,255,1), 4.5px 4.5px rgba(255,255,255,1)'
		}
	},
	plugins: [
		daisyui,
		typography,
		forms,
		heroPatterns({
			patterns: ['circuit-board'],

			// The foreground colors of the pattern
			colors: {
				default: '#1d4ed8'
			},

			// The foreground opacity
			opacity: {
				default: '0.4',
				100: '1.0'
			}
		})
	],
	daisyui: {
		themes: ['light', 'dark']
	}
};
