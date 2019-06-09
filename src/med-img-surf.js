import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkRenderWindow from 'vtk.js/Sources/Rendering/Core/RenderWindow';
import vtkRenderer from 'vtk.js/Sources/Rendering/Core/Renderer';
import vtkLight from 'vtk.js/Sources/Rendering/Core/Light';
import vtkOpenGLRenderWindow from 'vtk.js/Sources/Rendering/OpenGL/RenderWindow';
import vtkRenderWindowInteractor from 'vtk.js/Sources/Rendering/Core/RenderWindowInteractor';
import vtkInteractorStyleTrackballCamera from 'vtk.js/Sources/Interaction/Style/InteractorStyleTrackballCamera';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import vtkPolyDataReader from 'vtk.js/Sources/IO/Legacy/PolyDataReader';
import React, { Component } from 'react'
import ReactDOM from 'react-dom';
// import PropTypes from 'prop-types'

import MedImgService from './med-img-service';

import _ from 'underscore';
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
// import {Row, Card, Col, Container, ButtonToolbar, ButtonGroup, Button, ProgressBar} from 'react-bootstrap';
import {Col} from 'react-bootstrap';
// import {Eye, DownloadCloud, RefreshCw, Play, Delete, StopCircle, ArrowLeftCircle, ArrowRightCircle} from 'react-feather';
import qs from 'query-string';

class MedImgSurf extends Component {
  // static propTypes = {
  //   text: PropTypes.string
  // }

  constructor(){
    super()

    this.state = {
      instances: []
    }
  }

  componentDidMount(){
    const {
      location
    } = this.props

    const self = this;

    // this.jwtauth = new JWTAuthService();
    // this.jwtauth.setHttp(this.props.http);

    this.medimgservice = new MedImgService();
    this.medimgservice.setHttp(this.props.http);

	// ----------------------------------------------------------------------------
	// Standard rendering code setup
	// ----------------------------------------------------------------------------

    const renderWindow = vtkRenderWindow.newInstance();
    const renderer = vtkRenderer.newInstance();
    renderWindow.addRenderer(renderer);

    // const light = vtkLight.newInstance()
    // light.setLightType('HeadLight');
    // renderer.addLight(light);
    // renderer.setLightFollowCamera(true);

    const openglRenderWindow = vtkOpenGLRenderWindow.newInstance();
    renderWindow.addView(openglRenderWindow);
    const node = ReactDOM.findDOMNode(this.ref);

    openglRenderWindow.setContainer(node);


    const interactor = vtkRenderWindowInteractor.newInstance();

    const iStyle = vtkInteractorStyleTrackballCamera.newInstance();

    interactor.setInteractorStyle(iStyle);
    interactor.setView(openglRenderWindow);
    interactor.initialize();

    interactor.bindEvents(node);

    const reader = vtkPolyDataReader.newInstance();

    const camera = renderer.getActiveCamera();
    // camera.setPosition(...position);

    Promise.all(_.map([
    { surf: "Model_1_1.vtk", color: [1,86,104] },
    { surf: "Model_2_2.vtk", color: [1,86,104] },
    { surf: "Model_3_3.vtk", color: [15,129,199] },
    { surf: "Model_4_4.vtk", color: [15,129,199] },
    { surf: "Model_5_5.vtk", color: [255,85,11] },
    { surf: "Model_6_6.vtk", color: [255,85,11] },
    { surf: "Model_7_7.vtk", color: [255,48,79] },
    { surf: "Model_8_8.vtk", color: [255,48,79] },
    { surf: "Model_9_9.vtk", color: [199,255,0] },
    { surf: "Model_10_10.vtk", color: [199,255,0] },
    { surf: "Model_40_40.vtk", color: [13,226,234] },
    { surf: "Model_41_41.vtk", color: [13,226,234] },
    { surf: "left_cortex.vtk", color: [255, 255, 255], /*representation: 1,*/ opacity: 0.3 }], function(surf){
      return self.medimgservice.getPublicSurf(surf.surf)
      .then(function(res){
        reader.parseAsText(res.data);
        
        const polydata = reader.getOutputData();
        const mapper = vtkMapper.newInstance();
        const actor = vtkActor.newInstance();

        actor.setMapper(mapper);
        if(surf.color){
          actor.getProperty().setColor(..._.map(surf.color, (c)=>{return c/255}));
        }
        
        if(surf.representation != undefined){
          actor.getProperty().setRepresentation(surf.representation);
        }
        if(surf.opacity != undefined){
          actor.getProperty().setOpacity(surf.opacity);
        }
        actor.getProperty().setInterpolationToPhong();
        mapper.setInputData(polydata);

        renderer.addActor(actor);

        const position = camera.getFocalPoint();
        
        renderer.resetCamera();
        renderWindow.render();
      })
    }))
    .then(function(){
      self.azimuth(renderWindow, camera, 0.1)
    });
  }

  azimuth(renderWindow, camera, angle){
    const self = this;
    camera.azimuth(angle);
    setTimeout(function(){
      self.azimuth(renderWindow, camera, angle);
      renderWindow.render();
    },10)
  }

  render() {
    const {
      location
    } = this.props;

    return (
      <Col ref={(node) => {this.ref = node}}>
        
      </Col>
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

export default withRouter(connect(mapStateToProps)(MedImgSurf));