import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { securityHeaders } from "./deployment/security-headers.ts";
export default defineConfig({
  plugins: [react()],
  preview: { headers: securityHeaders },
});
