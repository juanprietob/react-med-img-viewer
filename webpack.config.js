
var path = require('path');
var webpack = require('webpack');
var vtkRules = require('vtk.js/Utilities/config/dependency.js').webpack.core.rules;

// Optional if you want to load *.css and *.module.css files
// var cssRules = require('vtk.js/Utilities/config/dependency.js').webpack.css.rules;

var entry = path.join(__dirname, './src/index.js');
const sourcePath = path.join(__dirname, './src');
const outputPath = path.join(__dirname, './dist');

module.exports = {
  entry,
  output: {
    path: outputPath,
    filename: 'index.js',
    libraryTarget: 'commonjs'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: ["babel-loader"],
      },
      { 
        test: /\.html$/, 
        loader: 'html-loader' 
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ].concat(vtkRules),
  },
  resolve: {
    alias: {
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      'react-router-dom': path.resolve(__dirname, './node_modules/react-router-dom'),
      'react-redux': path.resolve(__dirname, './node_modules/react-redux'),
      'react-bootstrap': path.resolve(__dirname, './node_modules/react-bootstrap'),
      'react-jwt-auth': path.resolve(__dirname, './node_modules/react-jwt-auth'),
      'react-feather': path.resolve(__dirname, './node_modules/react-feather')
    }
  },
  externals: {
    "med-img-reader": {
      commonjs: "med-img-reader"
    },
    react: {          
      commonjs: "react",          
      commonjs2: "react",          
      amd: "React",          
      root: "React"
    },      
    "react-dom": {          
      commonjs: "react-dom",          
      commonjs2: "react-dom",          
      amd: "ReactDOM",          
      root: "ReactDOM"
    },
    "react-router-dom": {          
      commonjs: "react-router-dom",          
      commonjs2: "react-router-dom"
    },
    "react-redux": {
      commonjs: "react-redux",
      commonjs2: "react-redux"
    },
    "react-bootstrap": {
      commonjs: "react-bootstrap",
      commonjs2: "react-bootstrap"
    },
    "react-jwt-auth": {
      commonjs: "react-jwt-auth",
      commonjs2: "react-jwt-auth"
    },
    "react-feather":{
      commonjs: "react-feather",
      commonjs2: "react-feather"
    }
  }
  
};

