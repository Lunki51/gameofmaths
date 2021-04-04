import React, { Component } from 'react';
import '../styles/quiz_style.css';
import '../styles/global_style.css'
import '../styles/global_variables.css';
import '../styles/chapters_style.css';
import {
    getChapters,
    getNumQuestion,
    getState,
    isOnQuiz,
    quitQuiz,
    setQuizState,
    submitAnswer
} from "../../../model/quizModel";



export class ChapterSelection extends Component{

    _isMounted=false

    constructor() {
        super();

        this.state = {
            list:[],
        }

    }

    handleClick= (event, anID) => {
        this.props.onSelection(event,anID)
    }

    componentDidMount() {

        this._isMounted=true
        this.handleGetChapter()

    }


    handleGetChapter = () => {
        getChapters().then((res) => {

            if(this._isMounted)
                this.setState({
                    list : res.data.chapters,
                })
        })
    }

    componentWillUnmount() {
        this._isMounted=false
    }

    render() {

        return <div className="container-chapter-selection">

            <h1 className="chapter-selection-headline">Chapitre</h1>

            { this.state.list.map((theElement, i) => {
               return <ListComponent theObject={theElement} key={i} onClick={this.handleClick}/>
            })}


        </div>

    }


}


class ListComponent extends Component{


    constructor(props) {
        super(props);

        this.state = {
            theObject:props.theObject,
        }

    }


    handleOnClick = (event) =>{


        this.props.onClick(event,this.state.theObject.chapterID)

    }


    render() {
        return (
            <input type="button" value={this.state.theObject.name} onClick={this.handleOnClick} className="container-chapter"/>
        );
    }


}





/**
 * @author Antoine LE BORGNE
 *
 * handle and display the login view
 * and manage the login system
 *
 */
class QuizView extends Component {

    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {

            logged:true,
            hasQuestion:true,
            errorMsg:"",
            chapter : "",
            numQuestion : 0,
            currentQuestion : 0,
            type : "",
            upperText : "",
            img : "",
            lowerText : "",
            answers : [],
            selectedAnswer:[],
            questionID : 0,
            openAnswer : "",
            quizDone : false,
            score : 0,
            mpGain:0,
            alreadyDone : false,
            backToChapter : false,

        }



    }

    componentDidMount() {
        document.title = "Quiz | Game Of Math"

        this._isMounted = true;

        this.setState({
            chapterID : this.props.chapter
        })




        isOnQuiz().then((response) =>{

                if(!response.data.isInQuiz){
                    //start new quiz quiz
                    getNumQuestion(this.props.chapter).then((response) =>{

                            if(response.data.returnState === 0){

                                if(this._isMounted) {

                                    this.setState({
                                        chapter: this.props.chapter,
                                        numQuestion: response.data.nbQuestion
                                    })


                                    setQuizState(this.state.currentQuestion) .then((res) => {

                                            this.setState({
                                                type : res.type,
                                                upperText : res.upperText,
                                                img : res.img,
                                                lowerText : res.lowerText,
                                                answers : res.answers,
                                                questionID : res.questionID,
                                            })

                                    })
                                }

                            }else{

                                if(this._isMounted) {

                                    this.setState({
                                        hasQuestion: false,
                                        errorMsg: response.data.msg
                                    })
                                }
                            }
                        })


                }else{
                    getState().then((response) => {

                            if(this._isMounted) {

                                this.setState({
                                    chapter: this.props.chapter,
                                    numQuestion: response.data.state.questionNb
                                })

                                this.setState({
                                    currentQuestion: response.data.state.lastQuestion
                                })


                                if (response.data.state.questionNb === response.data.state.lastQuestion) {

                                    this.setState({
                                        alreadyDone: true
                                    })
                                } else {
                                    setQuizState(this.state.currentQuestion).then((res) => {

                                            this.setState(res)

                                        })
                                }


                            }

                        })
                }


            }).catch(
            error =>{
                this.setState(
                    {
                        logged : false
                    }
                )
            }
        )




    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handleChoice = (event, aid) =>{

        const choice = aid
        const type = event.checked


        if(this.state.type === "QCU"){

            let answers = []

            answers.push(choice)

            this.setState({
                selectedAnswer : answers
            })

        }else if(type === true){

            let answers = this.state.selectedAnswer

            answers.push(choice)

            this.setState({
                selectedAnswer : answers
            })

        }else{

            const index = this.state.selectedAnswer.indexOf(choice)

            let answer = this.state.selectedAnswer

            if (index > -1) {
                answer.splice(index, 1);
            }

            this.setState({
                selectedAnswer : answer
            })
        }





    }



    handleSubmit = (event) =>{


        submitAnswer(this.state.type, this.state.questionID, this.state.currentQuestion,this.state.selectedAnswer,this.state.openAnswer)
            .then((response) => {

                if(response.data.redirect != null){
                    this.setState({
                        quizDone : true,
                        score: response.data.score,
                        mpGain :response.data.mpGain
                    })
                }else {

                    let current = this.state.currentQuestion+1

                    this.setState({
                        currentQuestion : current
                    })

                    setQuizState(current)
                        .then((res) => {

                            this.setState(res)

                        })

                }

            })

        //clear previous answers
        this.setState({
            selectedAnswer : [],
            openAnswer : ""
        })


        event.preventDefault();

    }


    handleOnChangeOpen = (event) =>{

        this.setState({openAnswer: event.target.value});

    }



    render() {



        // know if the user is already on a quiz
        if(this.state.hasQuestion){

            //if the quiz is not done
            if(!this.state.quizDone) {

                return <div className="container-quiz">

                            <button className="dismiss-btn" onClick={this.props.quit}>Abandonner</button>

                            <label className="compt-text"> {this.state.currentQuestion+1} / {this.state.numQuestion}</label>

                            <div className="question-container">
                                <h1 className="upperText">{this.state.upperText}</h1>
                                {(this.state.img)?<img className="image" src={this.state.img} alt="error not found"/>:null}
                                <h1 className="lowerText">{this.state.lowerText}</h1>
                            </div>

                            <form onSubmit={this.handleSubmit}>

                                    {(this.state.type === "OPEN")?

                                        <Answer key={1} parent={this} onChange={this.handleOnChangeOpen} type={this.state.type}/>

                                    :(this.state.type === "QCM")?

                                        <div className="answers-container-verif">
                                            {this.state.answers.map((answer, index) => {
                                                return (<Answer key={index} onChange={this.handleChoice} type={this.state.type} text={answer}/>)})}
                                        </div>

                                            :

                                        <div className="answers-container-verif">
                                            <fieldset className="group-radio" id="group">
                                                {this.state.answers.map((answer, index) => {
                                                    return (<Answer key={index} onChange={this.handleChoice} type={this.state.type} text={answer}/>)})}
                                            </fieldset>
                                        </div>
                                }


                                <input className="validate-btn" type="submit" value="Validé"/>
                            </form>


                        </div>





            //else the quiz is done -> display the finish
            }else{
                    return <div className="container-quiz">

                                <h1 className="finish-title"> FINI </h1>
                                <label className="score-title">score: {this.state.score}</label>
                                <label className="mpGain-title">MP gagnés: {this.state.mpGain}</label>

                                <form onSubmit={this.props.handleBackToChapter}>
                                    <input className="back-btn" type="submit" value="Retour aux chapitres"/>
                                </form>
                            </div>
            }
        }else {
            return <div className="background">
                <div className="container-quiz" >
                    <label className="error-text">{this.state.errorMsg}</label>
                </div>
            </div>
        }



    }
}



class Answer extends Component {


    handleClick = (event) => {

        event.target.children[0].checked = !event.target.children[0].checked
        this.props.onChange(event.target.children[0], this.props.text.answerID)
    }


    render() {


        if (this.props.type === "QCM") {
            return <>
                <div className="answer-quiz" onClick={this.handleClick}>
                    <input className="check-box" accept={this.props.text} type="checkbox"/>

                    <label className="check-box-text">{this.props.text.text}</label>
                </div>
            </>
        } else if (this.props.type === "QCU") {
            return <>
                <div className="answer-quiz-qcu" onClick={this.handleClick}>
                    <input className="check-box" name="group" accept={this.props.text} type="radio"/>

                    <label className="check-box-text">{this.props.text.text}</label>
                </div>
            </>
        } else {
            return <>
                <input type="type" value={this.props.parent.state.openAnswer} onChange={this.props.onChange}
                       className="answer-quiz-open" placeholder="Réponse"/>
            </>
        }
    }




}







//VIEWS OVERLAY
export class Quiz extends Component{


    constructor() {
        super();


        this.state = {
            onChapter : true,
            chapterSelected : -1
        }


        isOnQuiz().then((res) => {

            if(res.data.returnState === 0){

                if(res.data.isInQuiz){
                    this.setState({
                        onChapter : false,
                    })
                }

            }

        })



    }


    //HANDLERS
    handleChapterChoice = (event, theChapterID) => {

        this.setState(
            {
                chapterSelected:theChapterID,
                onChapter:false
            }
        )

    }

    handleBackToChapter = (event) =>{

        this.setState(
            {
                chapterSelected:-1,
                onChapter:true
            }
        )

        event.preventDefault();
    }

    handleQuit = (event) => {

        quitQuiz().then((res) => {

            if(res.data.returnState === 0){

                this.setState({
                    chapterSelected:-1,
                    onChapter:true
                })

            }

        })

    }


    render() {

        if(this.state.onChapter === true){
            return <ChapterSelection onSelection={this.handleChapterChoice}/>
        }else{
            return <QuizView quit={this.handleQuit} handleBackToChapter={this.handleBackToChapter} chapter={this.state.chapterSelected}/>
        }

    }


}

