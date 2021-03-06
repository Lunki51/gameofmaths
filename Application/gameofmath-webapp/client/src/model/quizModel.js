import Axios from "axios";

export function getQuestion(questionNb) {

    return Axios.post('/api/quiz/getQuestion', {questionNb})

}
export function getAnswersList(quizId,questionId) {

    return Axios.post('/api/quizManagement/getAnswersList', {quizId,questionId})

}


export function updateQuestion(id,upperText,lowerText,type,level) {

    return Axios.post('/api/quizManagement/updateQuestion', {id:id,upperText:upperText,lowerText:lowerText,type:type,level:level}).then(res=>{
        return res
    })

}

export function deleteAnswersOfQuestion(questionId){
    return Axios.post('/api/quizManagement/deleteAnswersOfQuestion', {questionId})
}

export function deleteQuestion(questionID,quizID){
    let questionId = parseInt(questionID)
    let quizId = parseInt(quizID)

    return Axios.post('/api/quizManagement/deleteQuestion', {questionId,quizId})
}

export function addQuestion(chapterID,quizID,upperText,lowerText,type,level){

    let chapterId = parseInt(chapterID)
    let quizId = parseInt(quizID)

    return Axios.post('/api/quizManagement/createQuestion', {chapterId:chapterId, quizId:quizId}).then(res => {
        if(res.data.returnState!==0)console.error("ERROR")
        return updateQuestion(res.data.question.questionID,upperText,lowerText,type,level)
    })

}

export function createAnswer(quizID,questionID,text,isValid){

    let questionId = parseInt(questionID)
    let quizId = parseInt(quizID)

    console.log(text,isValid)

    return Axios.post('/api/quizManagement/createAnswer', {questionId:questionId, quizId:quizId}).then(res => {
        if(res.data.returnState === 0){
            let answerId = res.data.answer.answerID
            if(text !== null){
                return Axios.post('/api/quizManagement/setText', {id:answerId, quizId:quizId,questionId:questionId, text: text} ).then(response=>{
                    if(isValid !== null){
                        return Axios.post('/api/quizManagement/setIsValid', {id:answerId, quizId:quizId,questionId:questionId, isValid: isValid} ).then(response=>{
                            return res.data.returnState
                            }
                        )
                    }
                })
            }

        }else{
            return res.data.msg
        }
    })
}

export function setQuizName(id,quizName){
    return Axios.post('/api/quizManagement/setQuizName', {id,quizName} )
}

export function setQuizOrdered(id,isOrder){
    return Axios.post('/api/quizManagement/setOrder', {id,isOrder} )
}

export function getQuizList(chapterId){

    return Axios.post('/api/quizManagement/getQuizListWithChapterId', {id:chapterId} )
}

export function deleteQuiz(quizId){
    return Axios.post('/api/quizManagement/deleteQuiz', {id:quizId} )
}

export function createQuiz(name,chapterId,isOrder){
    let chapterIdInt = parseInt(chapterId)
    return Axios.post('/api/quizManagement/createQuiz',{ordered:isOrder,chapter:chapterIdInt,quizName:name})
}

export function getQuestionList(quizId){
    return Axios.post('/api/quizManagement/getQuestionList',{id:quizId})
}

export function getState() {

    return Axios.post('/api/quiz/getState')
}

export function getNumQuestion(chapterID) {

    return Axios.post('api/quiz/startQuiz', {chapter:chapterID})

}

export function isOnQuiz() {

    return Axios.post('api/quiz/isInQuiz')

}

export function submitAnswer(type, questionID, questionNb, answers, answer) {


    if (type === "OPEN") {
        return Axios.post('api/quiz/postAnswer', {questionID, questionNb, answer})
    } else {
        return Axios.post('api/quiz/postAnswer', {questionID, questionNb, answers})
    }


}

export function getRemainingQuiz() {
    return Axios.post('/api/quiz/getRemainingQuiz')
}

export function getChapters(){
    return Axios.post('/api/quiz/getChapters')
}

export function quitQuiz(){

    return Axios.post('api/quiz/quit')

}

export function setQuizState(questionNb) {

    return new Promise(resolve => {
        getQuestion(questionNb)
            .then((res) => {

                    if (res.data.question.type === "OPEN") {
                        resolve({

                            questionID: res.data.question.questionID,
                            type: res.data.question.type,
                            upperText: res.data.question.upperText,
                            img: (res.data.question.image.length !== 0)? window.location.origin + res.data.question.image : null,
                            lowerText: res.data.question.lowerText,

                        })
                    } else {
                        resolve({

                            questionID: res.data.question.questionID,
                            type: res.data.question.type,
                            upperText: res.data.question.upperText,
                            img: (res.data.question.image.length !== 0)? window.location.origin + res.data.question.image : null,
                            lowerText: res.data.question.lowerText,
                            answers: res.data.question.answers

                        })
                    }

            })

    })


}

export function setImage(questionId,imageFile){
    let formData = new FormData();
    formData.append("image",imageFile)
    formData.append("questionId",questionId)
    return Axios.post('api/quizManagement/setImage',formData,{headers: {
            'Content-Type': 'multipart/form-data'
        }})
}

export function deleteImage(questionId){
    return Axios.post('api/quizManagement/deleteImage',{questionId})
}


