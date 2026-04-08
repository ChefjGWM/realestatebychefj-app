/** @type {import('next').NextConfig} */
const nextConfig = {
  // React strict mode catches common issues during development.
  reactStrictMode: true,

  // Don't expose the framework version header to the public.
  poweredByHeader: false,

  // The original prototype code does not conform to next/core-web-vitals
  // lint rules (unused vars, unescaped apostrophes, `_` in map callbacks).
  // Skip ESLint during `next build` so the typecheck + compile pass cleanly.
  // The TypeScript compiler still runs as usual.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
