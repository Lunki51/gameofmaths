import Axios from "axios";

export function getCastleInfo(castleID) {
    return  Axios.post('/api/castle/getCastleInfo',{castleID})
}

export function getCastleIDs(classID){
    return Axios.post('/api/castle/getCastleIDs', {classID})
}