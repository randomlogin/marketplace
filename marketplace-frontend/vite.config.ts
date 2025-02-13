import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
	plugins: [preact(), tailwindcss()],
	resolve: {
		alias: {
			'@': '/src',
		},
	},
	preview: {
		host: true,
		port: 3000,
		allowedHosts: [
			'spacesprotocol-marketplace-1981273617.us-east-1.elb.amazonaws.com',
			'spaces.market',
			'testnet.spaces.market'
		]
	},
	server: {
		proxy: {
			'/api': {
				target: 'http://localhost:8123',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, '')
			}
		},
		host: true,
		port: 3000,
		allowedHosts: [
			'spacesprotocol-marketplace-1981273617.us-east-1.elb.amazonaws.com',
			'spaces.market',
			'testnet.spaces.market'
		]
	},
});
