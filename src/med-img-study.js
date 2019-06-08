import React, { Component } from 'react'
// import PropTypes from 'prop-types'

import './styles.css';

import MedImgService from './med-img-service';

import _ from 'underscore';
import { connect } from "react-redux";
// import {JWTAuthService} from 'react-jwt-auth';
import { withRouter } from 'react-router-dom';
import {Card, Button, ListGroup} from 'react-bootstrap';

// import {Eye, DownloadCloud, RefreshCw, Play, Delete, StopCircle, ArrowLeftCircle, ArrowRightCircle} from 'react-feather';
import qs from 'query-string';

class MedImgStudy extends Component {
  // static propTypes = {
  //   text: PropTypes.string
  // }

  constructor(){
    super()    

    this.state = {
      studyid: ''
    }
  }

  componentDidMount(){
    const {
      location
    } = this.props

    const self = this;

    this.medimgservice = new MedImgService();
    this.medimgservice.setHttp(this.props.http);

    var studyid;
    if(location){
      const search = qs.parse(location.search);
      studyid = search.studyid;
    }

    if(studyid){
      self.medimgservice.getStudy(studyid)
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
      })
      .then(function(study){
        self.setState({...self.state, series: study.series});
      })
    }
  }

  viewImage(serie, studyid){
    const self  = this;
    const {history, location} = this.props;
    console.log(serie)
    if(history){
      history.push({
        pathname: '/viewer',
        search: qs.stringify({
          studyid: studyid,
          seriesid: serie.seriesid
        })
      });
    }
  }

  getStudyDetail(studyid){
    const {series} = this.state;
    const self = this;

    return _.map(series, function(serie){
      return (
      <ListGroup.Item key={serie.seriesnumber}>
        <Card>
          <h5><Card.Title class="card-title alert alert-info">{serie.seriesnumber}</Card.Title></h5>
          <Card.Body>
            <Card.Text>
              {serie.seriesdescription}
            </Card.Text>
            <Button variant="primary" onClick={()=>{self.viewImage(serie, studyid)}}>View</Button>
          </Card.Body>
        </Card>
      </ListGroup.Item>
      )
    });
  }

  render() {
    const {
      location
    } = this.props;

    var studyid;
    if(location){
      const search = qs.parse(location.search);
      studyid = search.studyid;
    }
    if(studyid){
      return (
        <ListGroup style={{overflow: "auto", height: "inherit"}}>
          {this.getStudyDetail(studyid)}
        </ListGroup>
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

export default withRouter(connect(mapStateToProps)(MedImgStudy));