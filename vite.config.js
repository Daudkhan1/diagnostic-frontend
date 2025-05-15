import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from "path";
import sveltePreprocess from 'svelte-preprocess';


export default ({ mode }) => {
  // Load app-level env vars to node-level env vars.
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    // base: '/annotation_portal/',
    plugins: [react(), svelte({
      preprocess: sveltePreprocess({
        typescript: true
      })
    })],
    optimizeDeps: {
      exclude: ['@annotorious/react'],
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
    server: {
      proxy: {
        "/api": "http://localhost:8080/",
      },
      host: "0.0.0.0", // Binds to all network interfaces
      port: 5173, // Ensure it's using the correct port
    },
  });
};
