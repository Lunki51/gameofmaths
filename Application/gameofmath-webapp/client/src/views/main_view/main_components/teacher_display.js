import React, { Component } from 'react';

export class TeacherDisplay extends Component{



    //HANDLERS





    //quiz
    handleDeleteQuiz    = (event) => {

    }

    handleCreateQuiz    = (event) => {

    }


    //students
    handleDeleteStudent = (event) => {

    }

    handleCreateStudent = (event) => {

    }

    //class
    handleDeleteClass   = (event) => {

    }

    handleCreateClass   = (event) => {

    }

    render() {
        return <>

            <h1>LOGGED HAS TEACHER</h1>
            <button onClick={this.props.logout}>LOGOUT</button>

        </>
    }


}