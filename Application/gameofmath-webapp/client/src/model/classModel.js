import Axios from "axios";


export function getAllClasses(){

 return Axios.post('/api/classManagement/getClasses')

}

export function createClass(name, grade){

 return Axios.post('/api/classManagement/create', {name,grade})

}

export function updateTheClass(id,newName, newGrade){
 Axios.post('/api/classManagement/rename', {id,newName}).then((res) => {
  return Axios.post('/api/classManagement/setGrade', {id,newGrade})
 })
}

export function deleteClass(id){

 return Axios.post('/api/classManagement/delete', {id})

}

