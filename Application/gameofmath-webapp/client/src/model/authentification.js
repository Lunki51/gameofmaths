import Axios from "axios";


/**
 * verify the validity of the username and password authentification
 * 
 * @param {*} username the username 
 * @param {*} password the password
 */
function auth(username, password){

    Axios.post("/api/user/auth",{username,password})
        .then((response) =>{
            if(response.data.returnState === 1){
                alert(response.data.msg)
            }else if(response.data.returnState === 0){
                window.location.reload(false);
            }

        })


}

/**
 * check if the user is currently logged
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
export function isAuth(){

   return Axios.post('/api/user/isLogged')

}

export default auth;

