
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';

import MedImgService from './med-img-service';
import medImgInteractorStyleImage from './med-img-interactor-style-image';

import _ from 'underscore';

// import {JWTAuthService} from 'react-jwt-auth';

import {Row, Card, Col, Container, ButtonToolbar, ButtonGroup, Button, ProgressBar} from 'react-bootstrap';

import {Eye, EyeOff, Loader} from 'react-feather';
import qs from 'query-string';

import vtkImageData from 'vtk.js/Sources/Common/DataModel/ImageData';
import vtkDataArray from 'vtk.js/Sources/Common/Core/DataArray';

import Constants from 'vtk.js/Sources/Rendering/Core/ImageMapper/Constants';
const { SlicingMode } = Constants;

import vtkRenderWindow from 'vtk.js/Sources/Rendering/Core/RenderWindow';
import vtkRenderer from 'vtk.js/Sources/Rendering/Core/Renderer';
import vtkOpenGLRenderWindow from 'vtk.js/Sources/Rendering/OpenGL/RenderWindow';
import vtkRenderWindowInteractor from 'vtk.js/Sources/Rendering/Core/RenderWindowInteractor';

import vtkImageMapper from 'vtk.js/Sources/Rendering/Core/ImageMapper';
import vtkImageSlice from 'vtk.js/Sources/Rendering/Core/ImageSlice';

const {FS, MedImgReader} = require('med-img-reader');
const Url = require('url-parse');

class MedImgViewer extends Component {
  // static propTypes = {
  //   text: PropTypes.string
  // }

  constructor(){
    super()

    this.state = {
      instances: [],
      showSlice: {
        X: {
          show: true,
          variant: 'success'
        }, 
        Y: {
          show: true,
          variant: 'success'
        }, 
        Z: {
          show: true,
          variant: 'success'
        }
      },
      progress: 0
    }

    this.slices = {
      X: {
        SlicingMode: SlicingMode.X
      },
      Y: {
        SlicingMode: SlicingMode.Y
      },
      Z: {
        SlicingMode: SlicingMode.Z
      }
    };
  }

  componentDidMount(){

    // this.jwtauth = new JWTAuthService();
    // this.jwtauth.setHttp(this.props.http);
    const self = this;

    this.medimgservice = new MedImgService();
    this.medimgservice.setHttp(this.props.http);

    self.medImgDir = '/med-img-reader';

    try{
      FS.stat(self.medImgDir);
    }catch(e){
      FS.mkdir(self.medImgDir);
    }
    
    this.initializeRenderWindows()
    .then(function(){
      self.getImageSeries();  
    })
  }

  componentDidUpdate(prevProps) {
    const self = this;
    if (self.props.location !== prevProps.location) {
      self.removeImageActors()
      .then(function(){
         self.getImageSeries(); 
      })
    }
  }

  getImageSeries(){
    const {
      location
    } = this.props;

    const self = this;

    const search = qs.parse(location.search);
    var seriesid = search.seriesid;

    return self.medimgservice.getInstances(seriesid)
    .then(function(res){
      self.setState({...self.state, seriesid: seriesid, instances: res.data}, ()=>{
        self.getDicomFiles()
        .then(function(series_dir){
          return self.readSeries(series_dir);
        })
        .then(function(medImgReader){
          return self.convertToVtkImage(medImgReader);
        })
        .then(function(vtkImg){
          return self.renderImage(vtkImg);
        })
        .then(function(){
          return self.setProgressPromise(0);
        });
      });
    });
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

  initializeRenderWindows(){

    return Promise.all(_.map(this.slices, function(slice){
      try{
        
        slice.renderWindow = vtkRenderWindow.newInstance(),
        slice.renderer = vtkRenderer.newInstance()
        slice.renderWindow.addRenderer(slice.renderer);

        slice.openglRenderWindow = vtkOpenGLRenderWindow.newInstance();
        slice.renderWindow.addView(slice.openglRenderWindow);
        const node = ReactDOM.findDOMNode(slice.ref);

        slice.openglRenderWindow.setContainer(node);

        slice.interactor = vtkRenderWindowInteractor.newInstance();

        const iStyle = medImgInteractorStyleImage.newInstance();
        iStyle.setInteractionMode('IMAGE_SLICING');

        slice.interactor.setInteractorStyle(
          iStyle
        );
        slice.interactor.setView(slice.openglRenderWindow);
        slice.interactor.initialize();

        slice.interactor.bindEvents(node);  

        return Promise.resolve(true);
      }catch(e){
        return Promise.reject(e);
      }
      
    }))
  }

  removeImageActors(){
    try{
      _.each(this.slices, function(slice){
        slice.renderer.removeActor(slice.imageActor);
      });  
      return Promise.resolve(true);
    }catch(e){
      return Promise.reject(e);
    }
    
    
  }

  renderImage(image){

    const data = image;
    const dataRange = data
      .getPointData()
      .getScalars()
      .getRange();
    const extent = data.getExtent();

    _.each(this.slices, function(slice){

      const imageMapper = vtkImageMapper.newInstance();
      imageMapper.setInputData(data);
      imageMapper.setSliceAtFocalPoint(true);
      imageMapper.setSlicingMode(slice.SlicingMode);

      const imageActor = vtkImageSlice.newInstance();
      imageActor.setMapper(imageMapper);
      imageActor.getProperty().setColorWindow(dataRange[1] - dataRange[0]);
      imageActor.getProperty().setColorLevel(dataRange[0] + (dataRange[1] - dataRange[0]) * .2);

      slice.renderer.addActor(imageActor);

      const camera = slice.renderer.getActiveCamera();
      const position = camera.getFocalPoint();
      // offset along the slicing axis
      const normal = imageMapper.getSlicingModeNormal();
      position[0] += normal[0];
      position[1] += normal[1];
      position[2] += normal[2];
      camera.setPosition(...position);
      switch (imageMapper.getSlicingMode()) {
        case SlicingMode.X:
          camera.setViewUp([0, 1, 0]);
          break;
        case SlicingMode.Y:
          camera.setViewUp([1, 0, 0]);
          break;
        case SlicingMode.Z:
          camera.setViewUp([0, 1, 0]);
          break;
        default:
      }
      camera.setParallelProjection(true);

      slice.imageMapper = imageMapper;
      slice.imageActor = imageActor;

      slice.renderer.resetCamera();
      slice.renderWindow.render();
    });
  }

  renderWindows(){
    _.each(this.slices, function(slice){
      slice.renderWindow.render();
    })
  }

  setProgressPromise(progress){
    const self = this;
    return new Promise(function(resolve, reject){
      self.setState({
        ...self.state, progress
      }, resolve);
    });
  }

  getDicomFiles(){
    const self = this;
    const {seriesid, instances} = self.state;

    var series_dir = self.medImgDir + '/' + seriesid;

    try{
      FS.stat(series_dir);
    }catch(e){
      FS.mkdir(series_dir);
    }

    var progress = 0;
    var progressIncrement = 1/instances.length * 100;

    return self.setProgressPromise(progress)
    .then(function(){
      return Promise.all(_.map(instances, function(instance){
        return Promise.all(_.map(instance.attachments, function(att){

          progress += progressIncrement;

          return self.setProgressPromise(progress)
          .then(function(){
            return self.medimgservice.getDicomBuffer(instance.instanceid, att);
          })
          .then(function(res){
            if(res.config && res.config.url && res.data){
              var url = new Url(res.config.url);
              var split_url = url.pathname.split("/");
              var img_filepath = series_dir + '/' + split_url[split_url.length - 1];
              try{
                FS.writeFile(img_filepath, new Uint8Array(res.data), { encoding: 'binary' });  
              }catch(e){
                console.error(e);
              }
            }else{
              console.error(res);
            }
          });
        }));
      }))
      .then(function(){
        return series_dir;
      });
    });
  }

  getSliceX(){
    const {showSlice} = this.state;
    return (<Col style={{display: showSlice.X.show? '': 'none'}}>
          <Card>
            <Card.Body ref={(node) => {this.slices.X.ref = node}}>
            </Card.Body>
          </Card>
        </Col>)
  }

  getSliceY(){
    const {showSlice} = this.state;
    
    return (<Col style={{display: showSlice.Y.show? '': 'none'}}>
        <Card>
          <Card.Body ref={(node) => {this.slices.Y.ref = node}}>
          </Card.Body>
        </Card>
      </Col>)  
  }

  getSliceZ(){
    const {showSlice} = this.state;
    
    return (<Col style={{display: showSlice.Z.show? '': 'none'}}>
          <Card>
            <Card.Body ref={(node) => {this.slices.Z.ref = node}}>
            </Card.Body>
          </Card>
        </Col>)
    
  }

  changeShowSlice(slice){
    const {
      showSlice
    } = this.state;

    showSlice[slice].show = !showSlice[slice].show;
    if(showSlice[slice].show){
      showSlice[slice].variant = "success";
    }else{
      showSlice[slice].variant = "danger";
    }

    this.setState({...this.state, showSlice: showSlice}, ()=>{this.renderWindows()});
  }

  getEye(show){
    if(show){
      return (<EyeOff/>);
    }else{
      return (<Eye/>);
    }
  }

  render() {
    const {
      location
    } = this.props;

    const {
      showSlice,
      progress
    } = this.state
    
    return (
      <Container fluid="true">
        <Row>
          <Col>
            <ProgressBar animated now={progress}/>
          </Col>
        </Row>
        <Row>
          <Col>
            <ButtonToolbar aria-label="Show slices">
              <ButtonGroup className="mr-2">
                <Button variant={showSlice.X.variant} onClick={(e)=>{this.changeShowSlice('X')}}>X {this.getEye(showSlice.X.show)}</Button>
                <Button variant={showSlice.Y.variant} onClick={(e)=>{this.changeShowSlice('Y')}}>Y {this.getEye(showSlice.Y.show)}</Button>
                <Button variant={showSlice.Z.variant} onClick={(e)=>{this.changeShowSlice('Z')}}>Z {this.getEye(showSlice.Z.show)}</Button>
              </ButtonGroup>
            </ButtonToolbar>
          </Col>
        </Row>
        <Row>
          {this.getSliceX()}
          {this.getSliceY()}
          {this.getSliceZ()}
        </Row>
      </Container>
      )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    http: state.jwtAuthReducer.http
  }
}

// const mapDispatchToProps = (dispatch) => {
//   return {
//     showJobDetail: params => {
//       dispatch({
//         type: 'show-job-detail',
//         job: job
//       });
//     }
//   }
// }

export default withRouter(connect(mapStateToProps)(MedImgViewer));

