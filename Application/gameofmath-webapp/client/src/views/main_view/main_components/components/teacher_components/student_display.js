import {Component} from "react";
import {getAllStudents} from "../../../../../model/studentModel";
import {getAllClasses} from "../../../../../model/classModel";

export class StudentDisplay extends Component{

    constructor() {
        super();

        this.state = {
            currentStudent:null,
            studentList:[],
            currentClass:0,
            classesList:[]
        }
    }

    componentDidMount() {




        getAllClasses().then(res => {
            this.setState({
                classesList: res.data.classes
            })

            getAllStudents(res.data.classes[0].classID).then(res => {

                if(this.props.formCreate){
                    this.setState({
                        studentList:res.data.students,
                        currentClass:this.props.formCreate.theClass,
                        currentStudent:this.props.formCreate.theStudent
                    })
                }else{
                    this.setState({
                        studentList:res.data.students
                    })
                }




            })
        })


    }

    handleDisplayOverView = (theStudent) => {

        this.setState({
            currentStudent:theStudent
        })


    }

    handleUpdateList = (event) => {

        getAllStudents(event.target.value).then(res => {

            this.setState({
                studentList:res.data.students,
                currentClass:event.target.value
            })

        })

    }


    render() {
        return <div className="teacher-default-dashboard-container">

            <div className="teacher-class-list-overview">

                <select onChange={this.handleUpdateList} className="teacher-student-creation-input" id="selected-class">
                    {this.state.classesList.map((theClass, index) => {
                        return <option key={index} value={theClass.classID}>{theClass.name}</option>
                    })}
                </select>

                {(this.state.studentList.length > 0)?this.state.studentList.map( (theStudent, index) => {
                    return <StudentRow onClick={this.handleDisplayOverView} value={theStudent} callbackOverView={this.handleDisplayOverView} key={index}/>
                }):<h1 className="teacher-student-list-none">Aucun Elève</h1>}

            </div>

            <div className="teacher-class-overview">

                {(this.state.currentStudent)? <StudentOverview theStudent={this.state.currentStudent}/> : <h1 className="teacher-no-class">Aucun élève selectionné</h1>}

            </div>

        </div>
    }


}


class StudentRow extends Component{



    handleClick = () => {
        this.props.onClick(this.props.value)
    }


    render() {
        return <div onClick={this.handleClick} className="teacher-class-row">
            <h1 className="teacher-class-row-title">{this.props.value.lastname}</h1>
        </div>
    }

}

class StudentOverview extends Component{

    render() {
        return<>
            <h1 className="teacher-class-overview-title">Nom: {this.props.theStudent.username} Prénom: {this.props.theStudent.lastname} </h1>

            <div className="teacher-class-overview-grade-container">
                <h1 className="teacher-class-overview-grade-text">Niveau: {this.props.theStudent.grade}</h1>
            </div>

        </>
    }

}