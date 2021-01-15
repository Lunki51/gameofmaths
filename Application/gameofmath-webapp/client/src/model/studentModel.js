import Axios from "axios";

/**
 * get all the student of a class
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
export function getAllStudents(id){
    console.log(id)
    return Axios.post('/api/classManagement/getStudents',{id:id})
}

/**
 * create a student
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
export function createStudent(lastName, FirstName){
    return Axios.post('/api/classManagement/create', {grade : "", name : ""})
}
