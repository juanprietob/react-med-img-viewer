
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

const Url = require('url-parse');

class MedImgViewSideBySide extends Component {
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

class MedImgViewAll extends Component {
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
      selectedLayout: props.selectedLayout? props.selectedLayout: 1,
      progress: 0, 
      vtkImage: props.vtkImagePrimary? props.vtkImagePrimary: 0,
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

  componentDidUpdate(prevProps){
    
    if(this.props.vtkImagePrimary !== prevProps.vtkImagePrimary){
      this.setState({...this.state, vtkImage: this.props.vtkImagePrimary});
    }

    if(this.props.selectedLayout !== prevProps.selectedLayout){
      this.setState({...this.state, selectedLayout: this.props.selectedLayout});
    }
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

  getToolBar(){
    const self = this;
    const {showToolBar} = self.props;

    if(showToolBar){
      return (<ButtonToolbar aria-label="Show slices">
        <Dropdown>
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            <Layout/>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {this.getLayoutOptions()}
          </Dropdown.Menu>
        </Dropdown>
      </ButtonToolbar>)  
    }else{
      return '';
    }
  }

  render() {
    return (
      <Container fluid="true" style={{padding: 0}}>
        {this.getToolBar()}
        <Row>
          {this.getLayout()}
        </Row>
      </Container>
      )
  }
}

export default MedImgViewer;

