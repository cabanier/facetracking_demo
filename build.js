const { build } = require("esbuild");
const define = {};

define[`process`] = undefined;
define[`process.env.NODE_ENV`] = JSON.stringify(process.env.NODE_ENV);

const options = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  outfile: "dist/bundle.js",
  define,
  tsconfig: "tsconfig.json",
  watch: {
    onRebuild(error, result) {
      if (error) console.error("watch build failed:", error);
      else console.error("watch build succeeded:", result);
    },
  },
};

build(options);
