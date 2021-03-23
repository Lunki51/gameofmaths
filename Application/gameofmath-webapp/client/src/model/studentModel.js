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

    return Axios.post('/api/classManagement/getAllStudents' )

}

export function deleteTheStudents(studentId,classId){

    return Axios.post('/api/classManagement/deleteStudent', {studentId:studentId, classId:classId} )


}


/**
 * create a student
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
export function createStudent(classId, login, lastname, firstname ){
    return  Axios.post('/api/classManagement/createStudent', {classId, login, lastname, firstname})
}