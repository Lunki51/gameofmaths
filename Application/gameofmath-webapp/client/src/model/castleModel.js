import Axios from "axios";

export function getCastleInfo(castleID) {
    return  Axios.post('/api/castle/getCastleInfo',{castleID})
}