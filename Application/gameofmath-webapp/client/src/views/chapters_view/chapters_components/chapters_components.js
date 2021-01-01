import React, { Component } from 'react';
import {ContainerTitle} from "../../global_components";
import Axios from "axios";


export class QuizBlock extends Component{


    constructor(props) {
        super(props);
    }


    handleClick(e,text, question){
        console.log('click on '+e.target)
    }


    render() {
        return <>
            <ContainerTitle className="container-quiz" title={this.state.currentQuestion.text}>
                <div className="answers-container">

                </div>
            </ContainerTitle>

        </>
    }


}



class Answer extends Component{


    render() {
        return <>
                <input type="button" className="answer-quiz" value={this.props.text} onClick={this.props.onClick}/>
            </>
    }


}


export class ChapterSelection extends Component{


    constructor() {
        super();

        this.state = {
            chapters : [],
            headline : ""
        }

    }


    componentDidMount() {

        Axios.get('/api/getChapter')
            .then((response) =>{

                let chapters = this.state.chapters.slice()

                response.data.map((item) =>{
                    chapters.push(item)

                    this.setState({
                        chapters : chapters,
                        headline : "Chapters"
                    })

                })

            })

    }

    render() {

        return <div className="container-chapter-selection">

            <h1 className="chapter-selection-headline">{this.state.headline}</h1>


            {this.state.chapters.map((mapping, i) => (
                <Chapter text={mapping} key={i} onClick={this.props.onSelection}/>
            ))}


        </div>

    }


}

class Chapter extends Component{


    render() {
        return (
            <button value={this.props.text} onClick={this.props.onClick} className="container-chapter">

                <h1 value={this.props.text} className="chapter-headline">{this.props.text}</h1>

                <img className="chapter-image" rel={this.props.img}/>

            </button>
        );
    }


}

export class QuizSelection extends Component{

    constructor() {
        super();

        this.state = {
            quiz : [],
            headline : this.props.chapter
        }
    }


    componentDidMount() {

        Axios.post('/api/getQuiz',(this.props.chapter))
            .then((response) =>{

                let quiz = this.state.quiz.slice()

                response.data.map((item) =>{
                    quiz.push(item)

                    this.setState({
                        quiz : quiz,
                        headline : this.props.chapter
                    })

                })

            })

    }






    render() {

        return <div className="container-chapter-selection">

            <h1 className="chapter-selection-headline">{this.state.headline}</h1>

            {this.state.quiz.map((mapping, i) => (
                <Quiz key={i} text={mapping}/>
            ))}

        </div>

    }

}


class Quiz extends Component{


    render() {

        return <button className="quiz-select-container">
            <h1 className="chapter-headline">{this.props.text}</h1>
        </button>

    }

}
