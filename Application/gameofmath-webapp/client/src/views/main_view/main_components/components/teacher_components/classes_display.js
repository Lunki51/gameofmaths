import {Component} from "react";
import {getAllClasses} from "../../../../../model/classModel";
import {getAllStudents} from "../../../../../model/studentModel";

export class ClassesDisplay extends Component{

    constructor() {
        super();

        this.state = {
            currentOverviewClass: null,
            classesList: []
        }

    }

    componentDidMount() {
        this.handleGetClasses()

        if(this.props.fromCreate){
            this.setState({
                currentOverviewClass: this.props.fromCreate
            })
        }


    }

    handleGetClasses = () => {

        getAllClasses().then((response) => {

            this.setState({
                classesList:response.data.classes
            })

        })





    }

    handleDisplayOverView = (theClass) => {
        this.setState({
            currentOverviewClass: theClass
        })
    }


    render() {
        return <div className="teacher-default-dashboard-container">

            <div className="teacher-class-list-overview">

                {this.state.classesList.map( (theClass, index) => {
                    return <ClassesRow value={theClass} callbackOverView={this.handleDisplayOverView} key={index} theClass={theClass}/>
                })}

            </div>

            <div className="teacher-class-overview">

                {(this.state.currentOverviewClass)? <ClassOverview theClass={this.state.currentOverviewClass}/> : <h1 className="teacher-no-class">Aucune classe selectionné</h1>}

            </div>

        </div>
    }


}

class ClassesRow extends Component{



    handleOpen = () => {
        this.props.callbackOverView(this.props.theClass)
    }


    render() {
        return <div onClick={this.handleOpen} className="teacher-class-row">
            <h1 className="teacher-class-row-title">{this.props.theClass.name}</h1>
        </div>
    }

}


class ClassOverview extends Component{

    _mount = false

    constructor() {
        super();

        this.state = {
            studentsAmount:0
        }
    }

    componentDidMount() {
        this._mount = true
        if(this._mount){
            getAllStudents(this.props.theClass.classID).then(res => {
                this.setState({
                    studentsAmount:res.data.students.length
                })

            })
        }

    }

    componentWillUnmount() {
        this._mount = false
    }


    componentDidUpdate(prevProps, prevState, snapshot) {
        getAllStudents(this.props.theClass.classID).then(res => {
            this.setState({
                studentsAmount:res.data.students.length
            })

        })
    }

    render() {
        return<>
            <h1 className="teacher-class-overview-title">Nom: {this.props.theClass.name}</h1>

            <div className="teacher-class-overview-grade-container">
                <h1 className="teacher-class-overview-grade-text">Niveau: {this.props.theClass.grade}</h1>
            </div>

            <div className="teacher-class-overview-numb">
                <h1 className="teacher-widget-title">Nombre d'élèves:</h1>
                <h1 className="teacher-widget-classes">{this.state.studentsAmount}</h1>
            </div>

        </>
    }


}