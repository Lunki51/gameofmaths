import Axios from "axios";


export function getQuestion(questionNb) {

    return Axios.post('/api/quiz/getQuestion', {questionNb})

}

export function getState() {

    return Axios.post('/api/quiz/getState')
}

export function getNumQuestion(chapter) {

    return Axios.post('api/quiz/startQuiz', {chapter})

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



