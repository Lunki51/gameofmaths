import React, { Component } from 'react';
import {NavigationBar} from '../global_components.js';

import './styles/quiz_style.css';
import '../global_style.css'
import '../global_variables.css';

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
            session: "username"
        }
    }

    componentDidMount(){
        document.title = "Quiz | Game Of Math"


        if(this.state.session == "username"){

            //TODO enable quiz


        }else{
            //TODO unable quiz
        }

    }

    render() {

        return <>
        
            <div className="background">
                <NavigationBar/>

                //TODO
            </div>
        </>


    }
}

export default QuizView;