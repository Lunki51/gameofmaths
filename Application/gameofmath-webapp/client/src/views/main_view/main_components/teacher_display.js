import React, { Component } from 'react';

import '../styles/teacher_style.css';
import '../styles/global_style.css'
import '../styles/global_variables.css';
import {NavigationBar} from "./components/global_teacher_components";
import {ClassManagement} from "./components/teacher_components/ClassManagement";
import {ClassDisplay} from "./components/teacher_components/ClassDisplay";

//////////////////////////////////////////////////////////////////////////////////////////////


export class TeacherDisplay extends Component{


    constructor() {
        super();

        this.state = {
            formComponent : null,
            warningComponent : null,
            overlayComponent : null
        }
    }


    //HANDLERS


    handleOpenClass = (theClass) =>{
        this.handleCloseOverlay()

        this.setState({
            overlayComponent : <ClassDisplay dispose={this.handleCloseOverlay} theClass={theClass}/>
        })

    }

    handleCloseOverlay = () =>{
      this.setState({
          overlayComponent : null
      })
    }



    //quiz
    handleDeleteQuiz    = (event) => {

    }

    handleCreateQuiz    = (event) => {

    }

    displayForm = (component) => {
        this.setState({
            formComponent:component
        })
    }

    closeForm = () => {

        this.setState({
            formComponent:null
        })
    }

    //students
    handleDeleteStudent = (event) => {

    }

    handleCreateStudent = (event) => {

    }


    render() {
        return <>

            <NavigationBar handleLogout={this.props.logout}/>

            <ClassManagement closeWarning={this.props.closeWarning}  displayWarning={this.props.displayWarning} closeForm={this.closeForm} displayForm={this.displayForm} openClass={this.handleOpenClass} deleteClass={this.handleDeleteClass}  handleClassSelection={this.handleClassSelection}/>

            {this.state.warningComponent}
            {this.state.overlayComponent}
            {this.state.formComponent}

        </>
    }


}


