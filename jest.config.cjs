module.exports = {
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/test/**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/test/setup.js"],
  clearMocks: true,
  restoreMocks: true,
  collectCoverageFrom: ["lib/**/*.js"],
  transform: {
    "^.+\\.js$": [
      "babel-jest",
      {
        babelrc: false,
        configFile: false,
        presets: [
          ["@babel/preset-env", { targets: { node: "current" } }],
          ["@babel/preset-react", { runtime: "classic" }],
        ],
      },
    ],
  },
};
