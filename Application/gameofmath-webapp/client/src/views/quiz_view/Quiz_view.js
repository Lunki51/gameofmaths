import React, { Component } from 'react';
import {NavigationBar} from '../global_components.js';

import './styles/quiz_style.css';
import '../global_style.css'
import '../global_variables.css';
import {QuizBlock} from "./quiz_components/quiz_components";


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

    }

    componentDidMount(){
        document.title = "Quiz | Game Of Math"
    }

    render() {

        return <>
        
            <div className="background">
                <NavigationBar/>
                <QuizBlock />
            </div>
        </>


    }
}

export default QuizView;