module.exports = {
  apps: [
    {
      name: "masys",
      cwd: "/home/github/applications/masys/current",
      script: "server.js",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
