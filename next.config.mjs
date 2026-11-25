/** @type {import('next').NextConfig} */
const nextConfig = {
  // The demo files are read with fs at request time, so they must ship with the server bundle.
  outputFileTracingIncludes: {
    "/*": ["./data/demos/**/*"],
    "/api/chat": ["./data/demos/**/*"],
  },
};

export default nextConfig;
