import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkFullScreenRenderWindow from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import vtkPolyDataReader from 'vtk.js/Sources/IO/Legacy/PolyDataReader';
import React, { Component } from 'react'
// import PropTypes from 'prop-types'

import MedImgService from 'med-img-service';

import _ from 'underscore';
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';

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

    // this.jwtauth = new JWTAuthService();
    // this.jwtauth.setHttp(this.props.http);

    this.medimgservice = new MedImgService();
    this.medimgservice.setHttp(this.props.http);

    const fileName = 'sphere.vtk'; // 'uh60.vtk'; // 'luggaBody.vtk';

	// ----------------------------------------------------------------------------
	// Standard rendering code setup
	// ----------------------------------------------------------------------------

	const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance();
	const renderer = fullScreenRenderer.getRenderer();
	const renderWindow = fullScreenRenderer.getRenderWindow();

	const resetCamera = renderer.resetCamera;
	const render = renderWindow.render;

	// ----------------------------------------------------------------------------
	// Example code
	// ----------------------------------------------------------------------------

	const reader = vtkPolyDataReader.newInstance();


	// reader.setUrl(`${__BASE_PATH__}/data/legacy/${fileName}`).then(() => {
	//   const polydata = reader.getOutputData(0);
	//   const mapper = vtkMapper.newInstance();
	//   const actor = vtkActor.newInstance();

	//   actor.setMapper(mapper);
	//   mapper.setInputData(polydata);

	//   renderer.addActor(actor);

	//   resetCamera();
	//   render();
	// });

  }

  render() {
    const {
      location
    } = this.props;

    return (
      <Row>
      Hello
      </Row>
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