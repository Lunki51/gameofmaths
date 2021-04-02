import Axios from "axios";


export function getAllClasses(){

 return Axios.post('/api/classManagement/getClasses')

}

export function createClass(name, grade){

 return Axios.post('/api/classManagement/create', {name:name,grade:grade})

}

export function regenerateMap(id){

 return Axios.post('/api/classManagement/regenerateMap', {id:id})

}

export function updateTheClass(id,newName, newGrade){
 return {name:Axios.post('/api/classManagement/rename', {id,newName}),grade:Axios.post('/api/classManagement/setGrade', {id,newGrade})};
}

export function deleteClass(id){

 return Axios.post('/api/classManagement/delete', {id})

}

