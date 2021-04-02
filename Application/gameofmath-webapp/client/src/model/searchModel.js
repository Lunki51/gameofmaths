import Axios from "axios";

/**
 * search in the database
 *
 * @param filter
 * @returns {Promise<AxiosResponse<any>>}
 */
export function search(filter){
    return Axios.post("/api/teacher/search",{key:filter})
}