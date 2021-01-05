import React, { Component } from 'react';


import './styles/quiz_style.css';
import '../global_style.css'
import '../global_variables.css';
import {Answer} from "./quiz_components/quiz_components";
import {getNumQuestion,getState, isOnQuiz, setQuizState, submitAnswer} from "../../model/quizModel";
import {Redirect} from "react-router";


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

    componentDidMount(props) {
        document.title = "Quiz | Game Of Math"

        this._isMounted = true;

        const chapter = (this.props.location.state)? this.props.location.state.chapter : this.state.chapter


        this.setState({
            chapter : chapter
        })




        isOnQuiz()
            .then((response) =>{

                if(!response.data.isInQuiz){
                    //start new quiz quiz
                    getNumQuestion(chapter)
                        .then((response) =>{

                            if(response.data.returnState === 0){


                                if(this._isMounted) {

                                    this.setState({
                                        chapter: chapter,
                                        numQuestion: response.data.nbQuestion
                                    })


                                    setQuizState(this.state.currentQuestion)
                                        .then((res) => {

                                            this.setState(res)

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
                    getState()
                        .then((response) => {

                            if(this._isMounted) {

                                this.setState({
                                    chapter: chapter,
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
                                    setQuizState(this.state.currentQuestion)
                                        .then((res) => {

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

    handleBack = (event) =>{

        //TODO reset question

        this.setState({
            backToChapter : true
        })


        event.preventDefault();

    }



    render() {

        if(this.state.logged){


            if(this.state.hasQuestion){



                if(!this.state.quizDone) {
                    return <>

                        <div className="background">
                            <div className="container-quiz">


                                <div className="question-container">
                                    <h1 className="upperText">{this.state.upperText}</h1>
                                    {(this.state.img)?<img className="image" src={this.state.img} alt="error not found"/>:null}
                                    <h1 className="lowerText">{this.state.lowerText}</h1>
                                </div>

                                <label className="compt-text"> {this.state.currentQuestion+1} / {this.state.numQuestion}</label>

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
                        </div>
                    </>
                }else{

                    if(this.state.backToChapter){
                        return <Redirect to="/chapter"/>
                    }else{
                        return  <div className="background">
                            <div className="container-quiz">

                                <h1 className="finish-title"> FINI </h1>
                                <label className="score-title">score: {this.state.score}</label>
                                <label className="mpGain-title">MP gagnés: {this.state.mpGain}</label>

                                <form onSubmit={this.handleBack}>
                                    <input className="back-btn" type="submit" value="Retour aux chapitres"/>
                                </form>
                            </div>
                        </div>
                    }


                }
            }else {
                return <div className="background">
                    <div className="container-quiz" >
                        <label className="error-text">{this.state.errorMsg}</label>
                    </div>
                </div>
            }

        }else{
            return <Redirect to="/login"/>
        }


    }
}

export default QuizView;