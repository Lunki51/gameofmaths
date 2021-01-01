import React, { Component } from 'react';


import './styles/quiz_style.css';
import '../global_style.css'
import '../global_variables.css';
import {ChapterSelection, QuizSelection} from "./quiz_components/quiz_components";


function getAnswers(question, index){




}


function nextQuestion(questions, index){
    return questions[index];
}



/**
 * @author Antoine LE BORGNE
 *
 * handle and display the login view
 * and manage the login system
 *
 */
class QuizView extends Component {

    constructor(props) {
        super(props);

        this.state = {
            currentView : <></>,
            chapter : ""
        }

    }

    componentDidMount(){
        document.title = "Quiz | Game Of Math"

        this.setState({
            currentView : <ChapterSelection onSelection={this.handleSelection}/>
        })
    }

    handleSelection(event){

        this.setState({
            currentView : <QuizSelection chapter={this.state.chapter}/>
        })

    }


    render() {

        return <>
        
            <div className="background">
                {this.state.currentView}
            </div>
        </>


    }
}

export default QuizView;