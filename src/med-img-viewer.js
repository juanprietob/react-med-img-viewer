
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';

import './styles.css'

import medImgInteractorStyleImage from './med-img-interactor-style-image';

import _ from 'underscore';

// import {JWTAuthService} from 'react-jwt-auth';

import {Row, Card, Col, Container, ButtonToolbar, ButtonGroup, Button, ProgressBar, Dropdown} from 'react-bootstrap';

import {Grid, Layout, Columns, Square, EyeOff, Eye, File} from 'react-feather';
import qs from 'query-string';

import vtkImageData from 'vtk.js/Sources/Common/DataModel/ImageData';
import vtkDataArray from 'vtk.js/Sources/Common/Core/DataArray';
import Constants from 'vtk.js/Sources/Rendering/Core/ImageMapper/Constants';
const { SlicingMode } = Constants;

import MedImgView from './med-img-view'

const ISELECTRON = window && window.require && window.require('electron');
const {FS, MedImgReader} = ISELECTRON? window.require('electron').remote.require('med-img-reader'): require('med-img-reader');

const Url = require('url-parse');

class MedImgViewSideBySide extends React.Component {
  render() {
    const {vtkImage, slicingMode1, slicingMode2, maxWidth, maxHeight} = this.props;
    return (
      <Col>
        <Row>
          <MedImgView id="XY-X" vtkImage={vtkImage} slicingMode={slicingMode1} maxWidth={maxWidth} maxHeight={maxHeight}/>
          <MedImgView id="XY-Y" vtkImage={vtkImage} slicingMode={slicingMode2} maxWidth={maxWidth} maxHeight={maxHeight}/>
        </Row>
      </Col>
    )
  }
}

class MedImgViewAll extends React.Component {
  render() {
    const {vtkImage, slicingMode1, slicingMode2, slicingMode3, maxWidth, maxHeight} = this.props;
    
    return (
      <Col>
        <Row>
          <MedImgView id="XYZ-X" vtkImage={vtkImage} slicingMode={slicingMode1} maxWidth={maxWidth} maxHeight={maxHeight}/>
          <MedImgView id="XYZ-Y" vtkImage={vtkImage} slicingMode={slicingMode2} maxWidth={maxWidth} maxHeight={maxHeight}/>
        </Row>
        <Row>
          <MedImgView id="XYZ-Z" vtkImage={vtkImage} slicingMode={slicingMode3} maxWidth={maxWidth} maxHeight={maxHeight}/>
        </Row>
      </Col>
    )
  }
}

class MedImgViewer extends Component {
  // static propTypes = {
  //   text: PropTypes.string
  // }

  constructor(props){
    super(props)

    this.state = {
      instances: [],
      selectedLayout: 1,
      progress: 0, 
      vtkImage: 0,
      maxWidth: props.maxWidth? props.maxWidth: "100vh",
      maxHeight: props.maxHeight? props.maxHeight: "100vh",
      filenames: []
    }

    this.ref = {};

    const self = this;
    
    this.layoutOptions = {
      1: {
        name: 'X', 
        icon: ()=>{return (<Square/>)},
        layout: ()=>{
          const {vtkImage, maxWidth, maxHeight} = this.state;
          // return (<MedImgView vtkImage={vtkImage} slicingMode={SlicingMode.X} maxWidth={maxWidth} maxHeight={maxHeight}/>)
          return (
            <MedImgView id="X" vtkImage={vtkImage} slicingMode={SlicingMode.X} maxWidth={maxWidth} maxHeight={maxHeight}/>
            ) 
        }
      },
      2: {
        name: 'Y', 
        icon: ()=>{return (<Square/>)},
        layout: ()=>{
          const {vtkImage, maxWidth, maxHeight} = this.state;
          return (<MedImgView vtkImage={vtkImage} slicingMode={SlicingMode.Y} maxWidth={maxWidth} maxHeight={maxHeight}/>)
        }
      },
      3: {
        name: 'Z', 
        icon: ()=>{return (<Square/>)},
        layout: ()=>{
          const {vtkImage, maxWidth, maxHeight} = this.state;
          return (<MedImgView vtkImage={vtkImage} slicingMode={SlicingMode.Z} maxWidth={maxWidth} maxHeight={maxHeight}/>)
        }
      },
      4: {
        name: 'XY', 
        icon: ()=>{return (<Row><Square/><Square/></Row>)},
        layout: ()=>{
          const {vtkImage, maxWidth, maxHeight} = this.state;
          return <MedImgViewSideBySide vtkImage={vtkImage} slicingMode1={SlicingMode.X} slicingMode2={SlicingMode.Y} maxWidth={maxWidth} maxHeight={maxHeight}/>
        }
      },
      5: {
        name: 'YZ', 
        icon: ()=>{return (<Row><Square/><Square/></Row>)},
        layout: ()=>{
          const {vtkImage, maxWidth, maxHeight} = this.state;
          return <MedImgViewSideBySide vtkImage={vtkImage} slicingMode1={SlicingMode.Y} slicingMode2={SlicingMode.Z} maxWidth={maxWidth} maxHeight={maxHeight}/>
        }
      },
      6: {
        name: 'XZ', 
        icon: ()=>{return (<Row><Square/><Square/></Row>)},
        layout: ()=>{
          const {vtkImage, maxWidth, maxHeight} = this.state;
          return <MedImgViewSideBySide vtkImage={vtkImage} slicingMode1={SlicingMode.X} slicingMode2={SlicingMode.Z} maxWidth={maxWidth} maxHeight={maxHeight}/>
        }
      },
      7: {
        name: 'XYZ', 
        icon: ()=>{return (<Grid/>)},
        layout: ()=>{
          const {vtkImage, maxWidth, maxHeight} = this.state;

          var mHeight = maxHeight;

          if(_.isString(mHeight)){
            mHeight = Number(mHeight.match(/\d+/g)[0])/2 + mHeight.match(/\D+/g)[0];
          }else{
            mHeight /= 2;
          }

          var mWidth = maxWidth;
          if(_.isString(maxWidth)){
            mWidth = Number(mWidth.match(/\d+/g)[0])/2 + mWidth.match(/\D+/g)[0];
          }else{
            mWidth /= 2;
          }

          return <MedImgViewAll vtkImage={vtkImage} slicingMode1={SlicingMode.X} slicingMode2={SlicingMode.Y} slicingMode3={SlicingMode.Z} maxWidth={mWidth} maxHeight={mHeight}/>
        }
      }
    };
      
  }

  componentDidMount(){
    
    const self = this;

    self.medImgDir = '/med-img-reader';
    
    try{
      FS.stat(self.medImgDir);
    }catch(e){
      FS.mkdir(self.medImgDir);
    }
  }

  componentDidUpdate(prevProps){
    if (this.props.location !== prevProps.location) {
      this.getImageSeries();
    }
  }

  read(){
    const self = this;
    const {filenames} = self.state;
    
    var readImg;
    if(filenames.length > 1){
      readImg = self.readSeries(filenames[0]);
    }else if(filenames.length == 1){
      readImg = self.readImage(filenames[0]);
    }else{
      readImg = Promise.reject("You need to select a filename");
    }

    readImg
    .then(function(medImgReader){
      return self.convertToVtkImage(medImgReader);
    })
    .then(function(vtkImg){
      self.setState({...self.state, vtkImage: vtkImg});
    })
    .catch(function(err){
      console.error(err);
    })
  }

  readSeries(series_dir){
    const self = this;

    try{
      const medImgReader = new MedImgReader();
      medImgReader.SetDirectory(series_dir);
      medImgReader.ReadDICOMDirectory();    
      return Promise.resolve(medImgReader);
    }catch(e){
      return Promise.reject(e);
    }   

  }

  readImage(imagefilename){
    const self = this;

    try{
      const medImgReader = new MedImgReader();
      medImgReader.SetFilename(imagefilename);
      medImgReader.ReadImage();
      return Promise.resolve(medImgReader);
    }catch(e){
      return Promise.reject(e);
    }   

  }

  convertToVtkImage(medImgReader) {

    const vtkImage = {
      origin: medImgReader.GetOrigin(),
      spacing: medImgReader.GetSpacing()
    };

    // Create VTK Image Data
    const imageData = vtkImageData.newInstance(vtkImage);

    // create VTK image data
    const scalars = vtkDataArray.newInstance({
      name: 'Scalars',
      values: medImgReader.GetImageBuffer(),
      numberOfComponents: medImgReader.GetNumberOfComponentsPerPixel(),
    });

    imageData.setDirection(...medImgReader.GetDirection());
    imageData.setDimensions(...medImgReader.GetDimensions());
    imageData.getPointData().setScalars(scalars);

    return Promise.resolve(imageData);
  }

  getLayoutOptions(){
    const self = this;
    return _.map(this.layoutOptions, function(opt, key){
      return (<Dropdown.Item eventKey={key} onClick={(e)=>{self.setLayout(key)}}>{opt.name} {opt.icon()}</Dropdown.Item>);
    })
  }

  setLayout(key){
    this.setState({...this.state, selectedLayout: key});
  }

  getLayout(){
    const {selectedLayout} = this.state;
    const layoutOpt = this.layoutOptions[selectedLayout];
    return layoutOpt.layout();
  }

  // writeFileLocal(file){
  //   const self = this;

  //   return new Promise(function(resolve, reject){
  //     const reader = new FileReader();
  //     reader.onload = (e)=>{
  //       FS.writeFile(self.medImgDir + '/temp.nrrd', new Uint8Array(e.target.result), { encoding: 'binary' });
  //       resolve(self.medImgDir + '/temp.nrrd');
  //     };
  //     reader.readAsArrayBuffer(file);
  //   });
  // }

  handleFileSelected(e){
    const self = this;

    const files = e.target.files;

    self.setState({...self.state, filenames: _.map(files, (f)=>{return f.path})}, 
      ()=>{
        self.read();
    });
  }

  getToolBar(){
    const self = this;
    
    var openfile = '';
    if(ISELECTRON){
      openfile = (<Button variant="success" onClick={()=>{
        const {imgFileSelector} = self.ref;
        if(imgFileSelector){
          imgFileSelector.click();
        }
      }}><File/><input ref={node => self.ref.imgFileSelector = node} type="file" onChange={(e)=>{self.handleFileSelected(e)}} style={{display:'none'}}/></Button>)
    }

    return (<ButtonToolbar aria-label="Show slices">
      {openfile}
      <Dropdown>
        <Dropdown.Toggle variant="success" id="dropdown-basic">
          <Layout/>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {this.getLayoutOptions()}
        </Dropdown.Menu>
      </Dropdown>
    </ButtonToolbar>)
  }

  render() {
    
    return (
      <Container fluid="true" style={{padding: 0}}>
        <Row>
          <Col>
            {this.getToolBar()}
          </Col>
        </Row>
        <Row>
          {this.getLayout()}
        </Row>
      </Container>
      )
  }
}

export default MedImgViewer;

