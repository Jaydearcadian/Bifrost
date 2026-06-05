module.exports = {
  output: 'export',
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '/bifrost',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};
