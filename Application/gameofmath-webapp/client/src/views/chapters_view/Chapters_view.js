import React, { Component } from 'react';


import './styles/chapters_style.css';
import '../global_style.css'
import '../global_variables.css';
import {ChapterSelection, QuizSelection} from "./chapters_components/chapters_components";

/**
 * @author Antoine LE BORGNE
 *
 *
 */
class ChapterView extends Component {

    constructor(props) {
        super(props);


    }

    componentDidMount(){
        document.title = "Quiz | Game Of Math"
    }

    handleSelection(event){

        this.setState({
            currentView : <QuizSelection chapter={this.state.chapter}/>
        })

    }


    render() {

        return <>
        
            <div className="background">
                <ChapterSelection />
            </div>
        </>


    }
}

export default QuizView;