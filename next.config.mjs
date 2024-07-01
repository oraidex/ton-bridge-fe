import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: [path.join("/", "styles")],
  },
};

export default nextConfig;
