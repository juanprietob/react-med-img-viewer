
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import { withRouter } from 'react-router-dom';

import './styles.css'

import medImgInteractorStyleImage from './med-img-interactor-style-image';

import _ from 'underscore';
import {Col} from 'react-bootstrap';

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

class MedImgView extends Component {

  constructor(props){
    super(props)
  }

  componentDidMount(){
    const self = this;
    this.initializeRenderWindow()
    .then(function(){
      return self.initializeActor();
    })
    .then(function(){
      self.renderImage();
    });
  }

  componentDidUpdate(prevProps){
    if (this.props.location !== prevProps.location) {
      this.removeImageActors();
    }
    if(this.props.slicingMode !== prevProps.slicingMode){
      var colorWindow = this.imageActor.getProperty().getColorWindow();
      var colorLevel = this.imageActor.getProperty().getColorLevel();
      this.removeImageActors();
      this.initializeActor();
      if(this.imageActor){
        this.imageActor.getProperty().setColorWindow(colorWindow);
        this.imageActor.getProperty().setColorLevel(colorLevel);
      }
    }
    if(this.props.vtkImage !== prevProps.vtkImage){
      this.initializeActor();
    }
    this.renderImage();
  }

  initializeRenderWindow(){
    try{
      this.renderWindow = vtkRenderWindow.newInstance(),
      this.renderer = vtkRenderer.newInstance()
      this.renderWindow.addRenderer(this.renderer);

      this.openglRenderWindow = vtkOpenGLRenderWindow.newInstance();
      this.renderWindow.addView(this.openglRenderWindow);
      const node = ReactDOM.findDOMNode(this.ref);

      this.openglRenderWindow.setContainer(node);
      node.removeChild(this.openglRenderWindow.getCanvas());

      const canvas = ReactDOM.findDOMNode(this.canvas);
      this.openglRenderWindow.setCanvas(canvas);
      
      this.interactor = vtkRenderWindowInteractor.newInstance();

      const iStyle = medImgInteractorStyleImage.newInstance();
      iStyle.setInteractionMode('IMAGE_SLICING');

      this.interactor.setInteractorStyle(
        iStyle
      );
      this.interactor.setView(this.openglRenderWindow);
      this.interactor.initialize();

      this.interactor.bindEvents(node);  

      return Promise.resolve();
    }catch(e){
      return Promise.reject(e);
    }
  }

  initializeActor(){
    const {vtkImage, slicingMode} = this.props;

    if(vtkImage){
      const data = vtkImage;

      if(!this.imageMapper){
        this.imageMapper = vtkImageMapper.newInstance();
        this.imageMapper.setSliceAtFocalPoint(true);
        this.imageMapper.setSlicingMode(slicingMode);
        this.imageMapper.setInputData(data);
      }

      if(!this.imageActor){

        const dataRange = data
          .getPointData()
          .getScalars()
          .getRange();
        // const extent = data.getExtent();

        this.imageActor = vtkImageSlice.newInstance();
        this.imageActor.setMapper(this.imageMapper);
        this.imageActor.getProperty().setColorWindow(dataRange[1]);
        this.imageActor.getProperty().setColorLevel(dataRange[0] + (dataRange[1] - dataRange[0]) * .25);
        this.imageActor.getProperty().setInterpolationTypeToNearest();
        this.renderer.addActor(this.imageActor);

        const camera = this.renderer.getActiveCamera();
        const position = camera.getFocalPoint();
        // offset along the slicing axis
        const normal = this.imageMapper.getSlicingModeNormal();
        switch (this.imageMapper.getSlicingMode()) {
          case SlicingMode.X:
            position[0] += normal[0];
            position[1] += normal[1];
            position[2] += normal[2];
            camera.setViewUp([0, 0, 1]);
            break;
          case SlicingMode.Y:
            position[0] -= normal[0];
            position[1] -= normal[1];
            position[2] -= normal[2];
            camera.setViewUp([0, 1, 0]);
            break;
          case SlicingMode.Z:
            position[0] += normal[0];
            position[1] += normal[1];
            position[2] += normal[2];
            camera.setViewUp([-1, -1, 0]);
            break;
          default:
        }
        camera.setPosition(...position);
        // camera.setParallelProjection(true);
        this.renderer.resetCamera();
      }
    }
    return Promise.resolve();
  }

  removeImageActors(){
    try{
      
      this.renderer.removeActor(this.imageActor);
      this.imageActor = 0;
      this.imageMapper = 0;
      
      return Promise.resolve(true);
    }catch(e){
      return Promise.reject(e);
    }
  }

  renderImage(){
    if(this.renderWindow){
      this.renderWindow.render();
    }
  }

  render() {
    const {maxHeight, maxWidth} = this.props;
    
    return (<Col ref={(node) => {this.ref = node}} style={{padding: 0}}>
        <canvas ref={node => this.canvas = node}
                width="300" height="300"
                style={{"max-height": maxHeight, "max-width": maxWidth}}
        />
      </Col>);
  }
}

export default withRouter(MedImgView);

