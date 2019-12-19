# react-med-img-viewer

> Visualize an image on the web/electron.js

[![NPM](https://img.shields.io/npm/v/react-med-img-viewer.svg)](https://www.npmjs.com/package/react-med-img-viewer) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-med-img-viewer
```

```
export NODE_OPTIONS=--max_old_space_size=8192
```

## Usage

```jsx
import {MedImgViewer, MedImgReader} from 'react-med-img-viewer';

```

If you like to control the layout using a button toolbar to show different layouts set `showToolBar` to 1. 

```jsx
	<MedImgViewer vtkImagePrimary={vtkImagePrimary} style={{padding: 0}} showToolBar={1}/>
```

You can fix the layout by using the prop `selectedLayout`
```jsx
	<MedImgViewer selectedLayout="3" vtkImagePrimary={vtkImagePrimary}/>
```

## Reading an image

The MedImgReader works for the electron environment. If you like to know how to read your image using itk.js on the browser, 
please follow the instructions at [itk.js](https://insightsoftwareconsortium.github.io/itk-js/examples/webpack.html)
The MedImgViewer receives a vtkImage and displays it.

```jsx
	var medImgReader = new MedImgReader();
	//filename is the path on disk.

	const self = this;

	return medImgReader.readImage(filename)
	.then(function(itkImage){
		return medImgReader.convertToVtkImage(itkImage);
	})
	.then(function(vtkImage){
		self.setState({...self.state, vtkImagePrimary: vtkImage});
	})
	.catch(function(e){
		console.error(e);
	});  
```


## License

MIT © [juanprietob](https://github.com/juanprietob)
