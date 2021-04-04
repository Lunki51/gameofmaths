import Axios from "axios";
import {getAllClasses} from "./classModel";

/**
 * get all the student of a class
 *
 * @return {Promise<AxiosResponse<any>>}
 */
export function getAllStudents(id){

    return Axios.post('/api/classManagement/getStudents', {id})

}

export function getAllTheStudents(){

    return Axios.post('/api/classManagement/getAllStudents')

}

export function deleteTheStudents(studentId,classId){

    return Axios.post('/api/classManagement/deleteStudent', {classId,studentId} )
}

export function regeneratePassword(classId,userId){

    return Axios.post('/api/classManagement/regeneratePassword', {classId:classId, userId:userId} )

}

export function updateStudentlogin(classId,studentId,newLogin){

    return Axios.post('/api/classManagement/setLogin', {studentId:studentId, classId:classId,login:newLogin} )
}

export function updateStudentlastName(classId,studentId,newLastName){

    return Axios.post('/api/classManagement/setLogin', {studentId:studentId, classId:classId,lastname:newLastName} )
}

export function updateStudentFirstName(classId,studentId,newFirstName){

    return Axios.post('/api/classManagement/setLogin', {studentId:studentId, classId:classId,firstname:newFirstName} )
}


export function getStudentInfo(){
    return Axios.post('/api/student/getInfo')
}

/**
 * create a student
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
export function createStudent(classId, login, lastname, firstname ){
    return  Axios.post('/api/classManagement/createStudent', {classId, login, lastname, firstname})
}