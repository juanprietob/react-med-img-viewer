
import _ from 'underscore';
import vtkImageData from 'vtk.js/Sources/Common/DataModel/ImageData';
import vtkDataArray from 'vtk.js/Sources/Common/Core/DataArray';

const ISELECTRON = window && window.require && window.require('electron');
const fs = ISELECTRON? window.require('electron').remote.require('fs'): undefined;
const path = ISELECTRON? window.require('electron').remote.require('path'): undefined;
const readImageLocalFileSync = ISELECTRON? window.require('electron').remote.require('itk/readImageLocalFileSync'): undefined;

class MedImgReader {

  constructor(){

  }

  readSeries(series_dir){
    // const self = this;

    // try{
    //   const medImgReader = new MedImgReader();
    //   medImgReader.SetDirectory(series_dir);
    //   medImgReader.ReadDICOMDirectory();    
    //   return Promise.resolve(medImgReader);
    // }catch(e){
    //   return Promise.reject(e);
    // }   

  }

  readImage(imagefilename){
    const self = this;

    try{
      const in_img = readImageLocalFileSync(imagefilename);
      return Promise.resolve(in_img);
    }catch(e){
      return Promise.reject(e);
    }   

  }

  convertToVtkImage(itkImage) {

    if(itkImage){
      const vtkImage = {
        origin: [...itkImage.origin],
        spacing: [...itkImage.spacing]
      };

      // Create VTK Image Data
      const imageData = vtkImageData.newInstance(vtkImage);

      // create VTK image data
      const scalars = vtkDataArray.newInstance({
        name: 'Scalars',
        values: itkImage.data,
        numberOfComponents: itkImage.imageType.components,
      });

      imageData.setDirection(...itkImage.direction.data);
      imageData.setDimensions(...itkImage.size);
      imageData.getPointData().setScalars(scalars);
      
      return Promise.resolve(imageData);
    }

    return Promise.reject("convertToVtkImage");
    
  }
  
}

export default MedImgReader;