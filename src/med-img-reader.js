
import _ from 'underscore';
import vtkImageData from 'vtk.js/Sources/Common/DataModel/ImageData';
import vtkDataArray from 'vtk.js/Sources/Common/Core/DataArray';
import ITKHelper from 'vtk.js/Sources/Common/DataModel/ITKHelper'

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
    return Promise.resolve(ITKHelper.convertItkToVtkImage(itkImage));
  }
  
}

export default MedImgReader;