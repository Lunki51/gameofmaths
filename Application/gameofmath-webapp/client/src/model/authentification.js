import Axios from "axios";


/**
 * verify the validity of the username and password authentification
 * 
 * @param {*} username the username 
 * @param {*} password the password
 */
function auth(username, password){

    return Axios.post("/api/user/auth",{username,password})

}


/**
 * check if the user is currently logged
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
export function isAuth(){

   return Axios.post('/api/user/isLogged')

}

/**
 * get the current user's username
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
export function getUsername(){

    return Axios.post('/api/user/username')

}

/**
 * get the current user type ('student'/'teacher')
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
export function getType(){

    return Axios.post('/api/user/getType')

}

/**
 * get the current player data
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
export function getInfo(){
    return Axios.post('/api/student/getInfo')
}

export default auth;

