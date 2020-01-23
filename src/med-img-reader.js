
import _ from 'underscore';
import vtkImageData from 'vtk.js/Sources/Common/DataModel/ImageData';
import vtkDataArray from 'vtk.js/Sources/Common/Core/DataArray';
import ITKHelper from 'vtk.js/Sources/Common/DataModel/ITKHelper'
import path from 'path'

const ISELECTRON = window && window.require && window.require('electron');
const MedImgReader = ISELECTRON? window.require('electron').remote.require('med-img-reader'): require('med-img-reader');


class MedImgReaderLib {

  constructor(){

  }

  readSeries(series_dir){
    const self = this;

    try{
      const medImgReader = new MedImgReader();
      medImgReader.SetDirectory(series_dir);
      medImgReader.ReadDICOMDirectory();    
      return Promise.resolve(medImgReader.GetOutput());
    }catch(e){
      return Promise.reject(e);
    }   

  }

  readImage(imagefilename){
    const self = this;

    try{
      var medimgreader = new MedImgReader();
      medimgreader.SetFilename(imagefilename);
      medimgreader.ReadImage();
      const in_img = medimgreader.GetOutput();
      return Promise.resolve(in_img);
    }catch(e){
      var ext = path.extname(imagefilename);
      if(new RegExp() == ".dcm")
      return Promise.reject(e);
    }   

  }

  convertToVtkImage(itkImage) {
    return Promise.resolve(ITKHelper.convertItkToVtkImage(itkImage));
  }
  
}

export default MedImgReaderLib;