
export default class MedImgService{

  constructor(){
    this.http = {};
  }

  setHttp(http){
    this.http = http;
  }

  createProject(project){
    return this.http({
      method: 'POST',
      url: '/med-img/project',
      data: project
    });
  }

  deleteProject(id){
    return this.http({
      method: 'DELETE',
      url: '/med-img/project/' + encodeURIComponent(id)
    });
  }

  getProject(query){
    return this.http({
      method: 'GET',
      url: '/med-img/project',
      params: query
    });
  }
  getProjectByName(name){
    return this.getProject({name});
  }

  getProjectById(id){
    return this.getProject({id});
  }

  getProjects(){
    return this.http({
      method: 'GET',
      url: '/med-img/projects'
    });
  }

  getStudy(id){
    return this.http({
      method: 'GET',
      url: '/med-img/dicom/study/' + encodeURIComponent(id)
    });
  }

  getSerie(id){
    return this.http({
      method: 'GET',
      url: '/med-img/dicom/serie/' + encodeURIComponent(id)
    });
  }

  getInstances(seriesid){
    return this.http({
      method: 'GET',
      url: '/med-img/dicom/instances/' + encodeURIComponent(seriesid)
    });
  }

  getDicom(id){
    return this.http({
      method: 'GET',
      url: '/med-img/dicom/' + encodeURIComponent(id)
    });
  }

  getDicomStream(id, filename){
    return this.http({
      method: 'GET',
      url: '/med-img/dicom/' + encodeURIComponent(id) + '/' + encodeURIComponent(filename),
      responseType: 'arraybuffer'
    });
  }

  deleteStudy(id){
    return this.http({
      method: 'DELETE',
      url: '/med-img/dicom/study/' + encodeURIComponent(id)
    });
  }

  deleteSerie(id){
    return this.http({
      method: 'DELETE',
      url: '/med-img/dicom/serie/' + encodeURIComponent(id)
    });
  }

  deleteDicom(id){
    return this.http({
      method: 'DELETE',
      url: '/med-img/dicom/' + encodeURIComponent(id)
    });
  }

  deleteDicomAttachment(id, filename){
    return this.http({
      method: 'DELETE',
      url: '/med-img/dicom/' + encodeURIComponent(id) + "/" + encodeURIComponent(filename)
    });
  }

  uploadDicomFile(dcmfile, projectname){

    projectname = projectname? encodeURIComponent(projectname) + '/': '';

    return this.http({
      method: 'POST',
      url: '/med-img/dicom/' + projectname,
      headers: { 
        "Content-Type": "application/octet-stream"
      },
      file: dcmfile
    });
  }
}