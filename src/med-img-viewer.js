
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';

import './styles.css'

import _ from 'underscore';

import {Row, Card, Col, Container, ButtonToolbar, ButtonGroup, Button, ProgressBar, Dropdown} from 'react-bootstrap';

import {Grid, Layout, Columns, Square, EyeOff, Eye, File} from 'react-feather';
import qs from 'query-string';

import vtkImageData from 'vtk.js/Sources/Common/DataModel/ImageData';
import vtkDataArray from 'vtk.js/Sources/Common/Core/DataArray';
import Constants from 'vtk.js/Sources/Rendering/Core/ImageMapper/Constants';
const { SlicingMode } = Constants;

import MedImgView from './med-img-view'

class MedImgViewSideBySide extends Component {
  render() {
    const {vtkImage, vtkLabelImage, slicingMode1, slicingMode2, labelMapOpacity, labelMapRange} = this.props;
    return (
      <Col>
        <Row>
          <MedImgView id="XY-X" vtkImage={vtkImage} vtkLabelImage={vtkLabelImage} labelMapRange={labelMapRange} labelMapOpacity={labelMapOpacity} slicingMode={slicingMode1}/>
          <MedImgView id="XY-Y" vtkImage={vtkImage} vtkLabelImage={vtkLabelImage} labelMapRange={labelMapRange} labelMapOpacity={labelMapOpacity} slicingMode={slicingMode2}/>
        </Row>
      </Col>
    )
  }
}

class MedImgViewAll extends Component {
  render() {
    const {vtkImage, vtkLabelImage, slicingMode1, slicingMode2, slicingMode3, labelMapOpacity, labelMapRange} = this.props;
    
    return (
      <Col>
        <Row style={{maxHeight: "40%"}}>
          <MedImgView id="XYZ-X" vtkImage={vtkImage} vtkLabelImage={vtkLabelImage} labelMapRange={labelMapRange} labelMapOpacity={labelMapOpacity} slicingMode={slicingMode1}/>
          <MedImgView id="XYZ-Y" vtkImage={vtkImage} vtkLabelImage={vtkLabelImage} labelMapRange={labelMapRange} labelMapOpacity={labelMapOpacity} slicingMode={slicingMode2}/>
        </Row>
        <Row style={{maxHeight: "60%"}}>
          <MedImgView id="XYZ-Z" vtkImage={vtkImage} vtkLabelImage={vtkLabelImage} labelMapRange={labelMapRange} labelMapOpacity={labelMapOpacity} slicingMode={slicingMode3}/>
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
      vtkLabelImage: props.vtkLabelImage? props.vtkLabelImage: 0,
      labelMapOpacity: props.labelMapOpacity? props.labelMapOpacity: 0,
      labelMapRange: props.labelMapRange? props.labelMapRange: [0, 1],
      filenames: [],
      style: props.style? props.style: {}
    }

    this.ref = {};

    const self = this;
    
    this.layoutOptions = {
      1: {
        name: 'X', 
        icon: ()=>{return (<Square/>)},
        layout: ()=>{
          const {vtkImage, vtkLabelImage, labelMapOpacity, labelMapRange} = this.state;
          return (
            <MedImgView id="X" vtkImage={vtkImage} vtkLabelImage={vtkLabelImage} labelMapOpacity={labelMapOpacity} labelMapRange={labelMapRange} slicingMode={SlicingMode.X}/>
            ) 
        }
      },
      2: {
        name: 'Y', 
        icon: ()=>{return (<Square/>)},
        layout: ()=>{
          const {vtkImage, vtkLabelImage, labelMapOpacity, labelMapRange} = this.state;
          return (<MedImgView vtkImage={vtkImage} vtkLabelImage={vtkLabelImage} labelMapOpacity={labelMapOpacity} labelMapRange={labelMapRange} slicingMode={SlicingMode.Y}/>)
        }
      },
      3: {
        name: 'Z', 
        icon: ()=>{return (<Square/>)},
        layout: ()=>{
          const {vtkImage, vtkLabelImage, labelMapOpacity, labelMapRange} = this.state;
          return (<MedImgView vtkImage={vtkImage} vtkLabelImage={vtkLabelImage} labelMapOpacity={labelMapOpacity} labelMapRange={labelMapRange} slicingMode={SlicingMode.Z}/>)
        }
      },
      4: {
        name: 'XY', 
        icon: ()=>{return (<Row><Square/><Square/></Row>)},
        layout: ()=>{
          const {vtkImage, vtkLabelImage, labelMapOpacity, labelMapRange} = this.state;
          return <MedImgViewSideBySide vtkImage={vtkImage} vtkLabelImage={vtkLabelImage} labelMapOpacity={labelMapOpacity} labelMapRange={labelMapRange} slicingMode1={SlicingMode.X} slicingMode2={SlicingMode.Y}/>
        }
      },
      5: {
        name: 'YZ', 
        icon: ()=>{return (<Row><Square/><Square/></Row>)},
        layout: ()=>{
          const {vtkImage, vtkLabelImage, labelMapOpacity, labelMapRange} = this.state;
          return <MedImgViewSideBySide vtkImage={vtkImage} vtkLabelImage={vtkLabelImage} labelMapOpacity={labelMapOpacity} labelMapRange={labelMapRange} slicingMode1={SlicingMode.Y} slicingMode2={SlicingMode.Z}/>
        }
      },
      6: {
        name: 'XZ', 
        icon: ()=>{return (<Row><Square/><Square/></Row>)},
        layout: ()=>{
          const {vtkImage, vtkLabelImage, labelMapOpacity, labelMapRange} = this.state;
          return <MedImgViewSideBySide vtkImage={vtkImage} vtkLabelImage={vtkLabelImage} labelMapOpacity={labelMapOpacity} labelMapRange={labelMapRange} slicingMode1={SlicingMode.X} slicingMode2={SlicingMode.Z}/>
        }
      },
      7: {
        name: 'XYZ', 
        icon: ()=>{return (<Grid/>)},
        layout: ()=>{
          const {vtkImage, vtkLabelImage, labelMapOpacity, labelMapRange} = this.state;
          return <MedImgViewAll vtkImage={vtkImage} vtkLabelImage={vtkLabelImage} labelMapOpacity={labelMapOpacity} labelMapRange={labelMapRange} slicingMode1={SlicingMode.X} slicingMode2={SlicingMode.Y} slicingMode3={SlicingMode.Z}/>
        }
      }
    };
      
  }

  componentDidUpdate(prevProps){
    
    if(this.props.vtkImagePrimary !== prevProps.vtkImagePrimary){
      this.setState({...this.state, vtkImage: this.props.vtkImagePrimary});
    }

    if(this.props.vtkLabelImage !== prevProps.vtkLabelImage){
      this.setState({...this.state, vtkLabelImage: this.props.vtkLabelImage});
    }

    if(this.props.labelMapOpacity !== prevProps.labelMapOpacity){
      this.setState({...this.state, labelMapOpacity: this.props.labelMapOpacity});
    }

    if(this.props.labelMapRange !== prevProps.labelMapRange){
      this.setState({...this.state, labelMapRange: this.props.labelMapRange});
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
    const {style} = this.state;

    return (
      <Container fluid="true" style={style}>
        {this.getToolBar()}
        <Row>
          {this.getLayout()}
        </Row>
      </Container>
      )
  }
}

export default MedImgViewer;

