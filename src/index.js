import React, { Component } from 'react'
// import PropTypes from 'prop-types'

import MedImgService from './medimg-service';

import _ from 'underscore';
import { connect } from "react-redux";
import {JWTAuthService} from 'react-jwt-auth';
import { withRouter } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';

// import {Eye, DownloadCloud, RefreshCw, Play, Delete, StopCircle, ArrowLeftCircle, ArrowRightCircle} from 'react-feather';
import qs from 'query-string';

class MedImgProjects extends Component {
  // static propTypes = {
  //   text: PropTypes.string
  // }

  constructor(){
    super()

    this.state = {
      projects: [],
      studies: [],
      series: []
    }
  }

  componentDidMount(){
    const {
      location
    } = this.props

    this.jwtauth = new JWTAuthService();
    this.jwtauth.setHttp(this.props.http);

    this.medimgservice = new MedImgService();
    this.medimgservice.setHttp(this.props.http);

    const self = this;

    self.medimgservice.getProjects()
    .then(function(res){
      var projects = res.data;
      self.setState({...self.state, projects: projects, }, ()=>{
        return self.getProjectStudies();
      });
    });
  }

  getProjectStudies(project){
    const self = this;

    const {
      projects
    } = this.state;

    const {
      location
    } = this.props

    if(!project){
      var projectname;
      if(location){
        const search = qs.parse(location.search);
        projectname = search.name;
      }

      if(projectname){
        project = _.find(projects, function(project){
          return project.name == projectname;
        })
      }
    }

    if(project){
      return Promise.all(_.map(project.studies, function(studyid){
        return self.medimgservice.getStudy(studyid)
        .then(function(res){
          return res.data;
        })
        .then(function(study){
          var patientid = _.uniq(_.pluck(study, 'patientid'));
          var studydate = _.uniq(_.pluck(study, 'studydate'));
          var modality = _.uniq(_.pluck(study, 'modality'));
          return {
            studyid,
            patientid,
            studydate, 
            modality, 
            series: study
          };
        });
      }))
      .then(function(studies){
        self.setState({...self.state, studies}, ()=>{
          return self.getStudySeries();
        });
      })
    }else{
      return Promise.resolve(true);
    }
  }

  showProjectDetail(project){
    const self  = this;
    const {history} = this.props;

    if(history){
      history.push({
        search: qs.stringify({name: project.name})
      });
    }

    self.getProjectStudies(project);
  }

  getStudySeries(study){
    const self = this;

    const {
      studies
    } = this.state;

    const {
      location
    } = this.props;

    if(!study){
      var studyid;
      if(location){
        const search = qs.parse(location.search);
        studyid = search.studyid;
      }

      if(studyid){
        study = _.find(studies, function(study){
          return study.studyid == studyid;
        });
      }
    }

    if(study){
      self.setState({
        ...self.state, series: study.series
      });
    }
  }

  showStudyDetail(study){
    const self  = this;
    const {history, location} = this.props;

    if(history){

      var search = qs.parse(location.search);
      search.studyid = study.studyid;
      history.push({
        search: qs.stringify(search)
      });

      this.getStudySeries(study);
    }
  }

  viewImage(seriesid){
    const self  = this;
    const {history, location} = this.props;

    if(history){
      history.push({
        pathname: '/viewer',
        search: qs.stringify({
          seriesid: seriesid
        })
      });
    }
  }

  getStudyDetail(){
    const {series} = this.state;
    const self = this;

    return _.map(series, function(serie){
      return (
      <Col sm={2} md={4}>
        <Card>
          <h5><Card.Title class="card-title alert alert-info">{serie.seriesnumber}</Card.Title></h5>
          <Card.Body>
            <Card.Text>
              {serie.seriesdescription}
            </Card.Text>
            <Button variant="primary" onClick={()=>{self.viewImage(serie.seriesid)}}>View</Button>
          </Card.Body>
        </Card>
      </Col>
      )
    });
  }

  getProjectDetail(){

    const {studies} = this.state;
    const self = this;

    return _.map(studies, function(study){
      return (
        <Col sm={2} md={4}>
          <Card>
            <h5><Card.Title class="card-title alert alert-info">{study.patientid}</Card.Title></h5>
            <Card.Body>
              <Card.Text>
                <ListGroup variant="flush">
                  <ListGroup.Item>Date: {study.studydate}</ListGroup.Item>
                  <ListGroup.Item>Modality: {study.modality}</ListGroup.Item>
                </ListGroup>
              </Card.Text>
              <Button variant="primary" onClick={()=>{self.showStudyDetail(study)}}>Detail</Button>
            </Card.Body>
            <Card.Footer>Number of series: {study.series.length}</Card.Footer>
          </Card>
        </Col>
      )
    });
  }

  getProjects(){
    const {projects} = this.state;
    const self = this;
    return _.map(projects, function(project){
      return (
        <Col sm={2} md={4}>
          <Card>
            <h5><Card.Title class="card-title alert alert-info">{project.name}</Card.Title></h5>
            <Card.Body>
              <Card.Text>
                {project.description}
              </Card.Text>
              <Button variant="primary" onClick={()=>{self.showProjectDetail(project)}}>Detail</Button>
            </Card.Body>
            <Card.Footer>Number of studies: {project.studies.length}</Card.Footer>
          </Card>
        </Col>
      );
    })
  }

  render() {
    const {
      location
    } = this.props;

    var projectname, studyid, seriesid;
    if(location){
      const search = qs.parse(location.search);
      projectname = search.name;
      studyid = search.studyid;
      seriesid = search.seriesid;
    }
    if(projectname && studyid){
      return (
        <Row>
          {this.getStudyDetail()}
        </Row>
        )
    }else if(projectname){
      return (
        <Row>
          {this.getProjectDetail()}
        </Row>
        )
    }else{
      return (
        <Row>
          {this.getProjects()}
        </Row>
        )
    }
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

export default withRouter(connect(mapStateToProps)(MedImgProjects));