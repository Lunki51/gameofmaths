import React, { Component } from 'react';
import {ContainerTitle} from "../../global_components";


export class QuizBlock extends Component{


    constructor(props) {
        super(props);


        this.state = {
            currentQuestion:{
                text : "Pourquoi ?",
                answerA : {
                    text: "parce que"
                },
                answerB : {
                    text: "why are you running"
                },
                answerC : {
                    text: "la B"
                },
                answerD : {
                    text: "D la reponse D"
                },
            }
        }
    }


    handleClick(text, question){
        console.log('click on '+text)
    }


    render() {
        return <>
            <ContainerTitle className="container-quiz" title={this.state.currentQuestion.text}>
                <div className="answers-container">
                    <Answer text={this.state.currentQuestion.answerA.text} />
                    <Answer text={this.state.currentQuestion.answerB.text} />
                    <Answer text={this.state.currentQuestion.answerC.text} />
                    <Answer text={this.state.currentQuestion.answerD.text} />
                </div>
            </ContainerTitle>

        </>
    }


}



class Answer extends Component{

    constructor(props) {
        super(props);

    }



    render() {
        return <>
                <input type="button" className="answer-quiz" value={this.props.text} onClick={this.props.onClick}/>
            </>
    }


}

