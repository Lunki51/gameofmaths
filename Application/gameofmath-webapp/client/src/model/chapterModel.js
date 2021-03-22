import Axios from "axios";


export function getAllChapter(){

    return Axios.post('/api/quizManagement/getChapter')

}

export function createChapter(name){

    return Axios.post('/api/quizManagement/createChapter', {name:name})

}

export function updateChapterName(id,newName){

    return Axios.post('/api/quizManagement/setChapterName', {id,newName})
}

export function deleteChapter(id){

    return Axios.post('/api/quizManagement/deleteChapter', {id})

}