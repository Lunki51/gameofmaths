import React, {Component} from "react";
import '../../../styles/teacher_style.css';
import {getAllStudents} from "../../../../../model/studentModel";
export class StudentManagement extends Component{

    constructor() {
        super();

        this.state = {

            studentListData:[],
            studentListObject:[],
            searchValue : "",


        }
    }

    componentDidMount() {

        this.updateLists()

    }

    updateLists = () => {


        getAllStudents(this.props.theClass.classID).then((res) => {

            console.log(res)

            this.setState({
                studentListData : res.data.students
            })


            this.displayStudent()
        })


    }


    displayStudent = () => {

        let items = []

        this.state.studentListData.map((student, index) => {

            if(this.passFilter(student,this.state.searchValue))
            items.push(
                <StudentInfo theStudent={student} key={index}/>
            )

        })

        this.setState({
            studentListData:items
        })


    }

    passFilter = (theStudent, filter) => {

        return (
            filter === "" ||
            theStudent.lastname.includes(filter) ||
            theStudent.firstname.includes(filter) ||
            theStudent.login.includes(filter)
        )

    }

    handleSubmit = () => {



    }

    handleSearch = (event) => {
        this.setState({
            searchValue: event.target.value
        })
    }

    render() {


        return <div className="student-list-container">
                <button onClick={null} className="add-class-button">Ajouter</button>
                <input value={this.state.searchValue} placeholder="rechercher..." onChange={this.handleSearch} className="class-search-input"/>
                <div className="student-list">
                    {this.state.studentListObject}
                </div>
        </div>


    }
}

class StudentInfo extends Component{


    render() {


        return <div className="student-info-container">
            <label className="student-name-lower">{this.props.theStudent.firstname}  {this.props.theStudent.lastname}</label>
        </div>


    }
}





class EditStudent extends Component{


    render() {


        return <div>
            <form onSubmit={null}>

            </form>
        </div>



    }


}