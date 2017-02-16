'use strict';

const path = require('path');
const webpack = require('webpack');


const PATHS = {
  input: path.resolve(__dirname, 'src') ,
  output: path.resolve(__dirname, 'public'),
};

module.exports = env => {
  return {
    entry: `${PATHS.input}/index.js`,
    output: {
      path: PATHS.output,
      filename: 'bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          include: PATHS.input,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['es2015', 'react']
              },
            },
          ],
        },
      ],
    },
  };
};
