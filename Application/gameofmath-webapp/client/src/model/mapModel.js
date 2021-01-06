import Axios from "axios";


export function getMap(){
    return Axios.get('/graphics/renderer')
}