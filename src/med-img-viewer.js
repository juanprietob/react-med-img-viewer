
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';

import './styles.css'

import MedImgService from './med-img-service';
import medImgInteractorStyleImage from './med-img-interactor-style-image';

import _ from 'underscore';

// import {JWTAuthService} from 'react-jwt-auth';

import {Row, Card, Col, Container, ButtonToolbar, ButtonGroup, Button, ProgressBar, Dropdown} from 'react-bootstrap';

import {Grid, Layout, Columns, Square, EyeOff, Eye} from 'react-feather';
import qs from 'query-string';

import vtkImageData from 'vtk.js/Sources/Common/DataModel/ImageData';
import vtkDataArray from 'vtk.js/Sources/Common/Core/DataArray';
import Constants from 'vtk.js/Sources/Rendering/Core/ImageMapper/Constants';
const { SlicingMode } = Constants;

import MedImgView from './med-img-view'

import {FS, MedImgReader} from 'med-img-reader';

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
      maxHeight: props.maxHeight? props.maxHeight: "100vh"
    }

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
        icon: ()=>{return (<t><Square/><Square/></t>)},
        layout: ()=>{
          const {vtkImage, maxWidth, maxHeight} = this.state;
          return <MedImgViewSideBySide vtkImage={vtkImage} slicingMode1={SlicingMode.X} slicingMode2={SlicingMode.Y} maxWidth={maxWidth} maxHeight={maxHeight}/>
        }
      },
      5: {
        name: 'YZ', 
        icon: ()=>{return (<t><Square/><Square/></t>)},
        layout: ()=>{
          const {vtkImage, maxWidth, maxHeight} = this.state;
          return <MedImgViewSideBySide vtkImage={vtkImage} slicingMode1={SlicingMode.Y} slicingMode2={SlicingMode.Z} maxWidth={maxWidth} maxHeight={maxHeight}/>
        }
      },
      6: {
        name: 'XZ', 
        icon: ()=>{return (<t><Square/><Square/></t>)},
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

    self.getImageSeries(); 
    
  }

  componentDidUpdate(prevProps){
    if (this.props.location !== prevProps.location) {
      this.getImageSeries();
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
        .then(function(series_description){
          if(series_description.modality[0] == "MR"){
            return self.readSeries(series_description.series_dir);
          }else{
            if(series_description.files.length > 0){
              return self.readImage(series_description.files[0].filename);  
            }else{
              return Promise.reject("No files found!");
            }
          }
        })
        .then(function(medImgReader){
          return self.convertToVtkImage(medImgReader);
        })
        .then(function(vtkImg){
          self.setState({...self.state, vtkImage: vtkImg});
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

    var series_description = {
      modality: [],
      files: [],
      series_dir
    };

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
                series_description.modality.push(instance.modality);
                series_description.files.push({filename: img_filepath, modality: instance.modality});
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
        series_description.modality = _.uniq(series_description.modality);
        return series_description;
      });
    });
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

  getProgressOrImage(){
    const {
      progress
    } = this.state

    if(progress){
      return (
        <Col>
          <ProgressBar animated now={progress}/>
        </Col>);
    }else{
      return this.getLayout();
    }
    
  }

  render() {
    
    return (
      <Container fluid="true" style={{padding: 0}}>
        <Row>
          <Col>
            <ButtonToolbar aria-label="Show slices">
              <Dropdown>
                <Dropdown.Toggle variant="success" id="dropdown-basic">
                  <Layout/>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {this.getLayoutOptions()}
                </Dropdown.Menu>
              </Dropdown>
            </ButtonToolbar>
          </Col>
        </Row>
        <Row>
          {this.getProgressOrImage()}
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

