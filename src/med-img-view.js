
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

import vtkRenderWindow from 'vtk.js/Sources/Rendering/Core/RenderWindow';
import vtkRenderer from 'vtk.js/Sources/Rendering/Core/Renderer';
import vtkOpenGLRenderWindow from 'vtk.js/Sources/Rendering/OpenGL/RenderWindow';
import vtkRenderWindowInteractor from 'vtk.js/Sources/Rendering/Core/RenderWindowInteractor';
import vtkImageMapper from 'vtk.js/Sources/Rendering/Core/ImageMapper';
import vtkImageSlice from 'vtk.js/Sources/Rendering/Core/ImageSlice';
import vtkPiecewiseFunction from 'vtk.js/Sources/Common/DataModel/PiecewiseFunction'
import vtkColorTransferFunction from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction';
import vtkColorMaps from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction/ColorMaps';

const { SlicingMode } = Constants;

class MedImgView extends Component {

  constructor(props){
    super(props)
    this.imageActor = 0;
    this.imageMapper = 0;
    this.renderWindow = 0;
    this.renderer = 0;
    this.openglRenderWindow = 0;
    this.state = {
      windowCenter: props.windowCenter? props.windowCenter : [0, -0.4]
    };
    this.labelMap = 0;
  }

  componentDidMount(){
    const self = this;
    this.initializeRenderWindow()
    .then(()=>{
      return self.initializeActor();
    })
    .then(()=>{
      return self.initializeLabelMapActor();
    })
    .then(()=>{
      self.renderImage();
    });
  }

  componentDidUpdate(prevProps){
    if (this.props.location !== prevProps.location) {
      this.removeImageActors();
    }
    if(this.props.slicingMode !== prevProps.slicingMode){
      this.removeImageActors();
      this.initializeActor();
      if(this.imageActor){
        var colorWindow = this.imageActor.getProperty().getColorWindow();
        var colorLevel = this.imageActor.getProperty().getColorLevel();
        this.imageActor.getProperty().setColorWindow(colorWindow);
        this.imageActor.getProperty().setColorLevel(colorLevel);
      }
    }
    if(this.props.vtkImage !== prevProps.vtkImage){
      if(this.imageActor){
        this.removeImageActors();
      }
      this.initializeActor();
    }
    if(this.props.vtkLabelImage !== prevProps.vtkLabelImage){
      this.removeLabelMapActor();
      this.initializeLabelMapActor();
    }
    if(this.props.windowCenter !== prevProps.windowCenter){
      this.setState({...this.state, windowCenter: this.props.windowCenter});
    }
    if(this.props.labelMapOpacity != prevProps.labelMapOpacity && this.labelMap && this.labelMap.actor){
      this.setLabelMapOpacity(this.props.labelMapOpacity);
    }
    if(this.props.labelMapRange != prevProps.labelMapRange && this.labelMap && this.labelMap.actor){
      this.setLabelMapRange(this.props.labelMapRange);
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

      const dims = node.getBoundingClientRect();
      const devicePixelRatio = window.devicePixelRatio || 1;
      this.openglRenderWindow.setSize(
        Math.floor(dims.width * devicePixelRatio),
        Math.floor(dims.height * devicePixelRatio)
      );

      const camera = this.renderer.getActiveCamera();
      camera.setWindowCenter(...this.state.windowCenter);
      
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
        this.imageMapper.setSlicingMode(slicingMode);
        this.imageMapper.setInputData(data);
        this.imageMapper.setSliceAtFocalPoint(true);
      }

      if(!this.imageActor){

        const dataRange = data
          .getPointData()
          .getScalars()
          .getRange();

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
            position[0] += normal[0];
            position[1] += normal[1];
            position[2] += normal[2];
            camera.setViewUp([1, 0, 0]);
            break;
          case SlicingMode.Z:
            position[0] -= normal[0];
            position[1] -= normal[1];
            position[2] -= normal[2];
            camera.setViewUp([0, -1, 0]);
            break;
          default:
        }
        
        camera.setPosition(...position);
        this.renderer.resetCamera();
        
      }
    }
    return Promise.resolve();
  }

  initializeLabelMapActor(){

    const {vtkLabelImage, slicingMode, labelMapOpacity, labelMapRange} = this.props;
    
    if(vtkLabelImage){
      var labelMap = {
        mapper: vtkImageMapper.newInstance(),
        actor: vtkImageSlice.newInstance(),
        colorTransfer: vtkColorTransferFunction.newInstance(),
        pieceWise: vtkPiecewiseFunction.newInstance(),
      };

      labelMap.mapper.setSlicingMode(slicingMode);
      labelMap.mapper.setInputData(vtkLabelImage);
      labelMap.mapper.setSliceAtFocalPoint(true);

      labelMap.actor.setMapper(labelMap.mapper);
      
      const preset = vtkColorMaps.getPresetByName('erdc_rainbow_bright');
      labelMap.colorTransfer.applyColorMap(preset);
      labelMap.colorTransfer.setMappingRange(0, 1);
      labelMap.colorTransfer.updateRange();

      labelMap.pieceWise = vtkPiecewiseFunction.newInstance();
      labelMap.pieceWise.removeAllPoints();
      labelMap.pieceWise.addPoint(0, labelMapRange[0]);
      labelMap.pieceWise.addPoint(1, labelMapRange[1]);

      labelMap.actor = vtkImageSlice.newInstance();
      labelMap.actor.setMapper(labelMap.mapper);
      labelMap.actor.getProperty().setRGBTransferFunction(labelMap.colorTransfer);
      labelMap.actor.getProperty().setScalarOpacity(labelMap.pieceWise);
      labelMap.actor.getProperty().setInterpolationTypeToNearest();
      labelMap.actor.getProperty().setOpacity(labelMapOpacity);

      this.labelMap = labelMap;
      this.renderer.addActor(labelMap.actor);
      this.renderer.resetCamera();
    }
  }

  setLabelMapOpacity(opacity){
    this.labelMap.actor.getProperty().setOpacity(opacity);
    this.renderImage();
  }

  setLabelMapRange(range){
    this.labelMap.pieceWise.removeAllPoints();
    if(range && range.length > 1){
      var step = 1.0/(range.length - 1);
      _.each(range, (r, i)=>{
        this.labelMap.pieceWise.addPoint(step*i, r);
      })
    }
    this.labelMap.actor.getProperty().setScalarOpacity(this.labelMap.pieceWise);
    this.renderImage();
  }

  removeLabelMapActor(){
    try{
      if(this.labelMap && this.labelMap.actor){
        this.renderer.removeActor(this.labelMap.actor);
        this.labelMap = 0;
      }
      
      return Promise.resolve(true);
    }catch(e){
      return Promise.reject(e);
    }
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
    return (<Col ref={(node) => {this.ref = node}} style={{padding: 0}}>
        <canvas ref={node => this.canvas = node}/>
      </Col>);
  }
}

export default withRouter(MedImgView);

