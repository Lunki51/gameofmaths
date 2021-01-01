import Axios from "axios";


/**
 * verify the validity of the username and password authentification
 * 
 * @param {*} username the username 
 * @param {*} password the password
 */
function auth(username, password){

    Axios.post("/api/auth",{username,password})
        .then((response) => {

            if(response.data){



            }else{

                document.getElementById('username').style.borderColor = '#c44242'
                document.getElementById('password').style.borderColor = '#c44242'

            }

        })

}

export function logout(){

}

export function isAuth(){

}

export default auth;

