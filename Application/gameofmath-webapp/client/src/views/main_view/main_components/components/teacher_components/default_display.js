import {Component} from "react";
import "../../../styles/teacher_style20.css"
import "../../../styles/global_variables.css"
import {getAllClasses} from "../../../../../model/classModel";
import {getAllTheStudents} from "../../../../../model/studentModel";

/**
 *
 * @author Antoine LE BORGNE & Tom DESORMEAUX--DELAUNAY
 *
 */
export class DefaultDisplay extends Component{

    constructor() {
        super();

        this.state = {
            classesAmount: 0,
            studentAmount: 0,
        }
    }

    componentDidMount() {
        this.getTotal()
    }


    getTotal = () =>{


        getAllClasses().then(res => {
            this.setState({
                classesAmount: res.data.classes.length
            })
        })

        getAllTheStudents().then(res => {
            this.setState({
                studentAmount: res.data.students.length,
            })
        })


    }



    render(){
        return <div className="teacher-default-dashboard-container">

            <div className="teacher-classes-amount">
                <h2 className="teacher-widget-title">Total de classes</h2>
                <h1 className="teacher-widget-classes">{this.state.classesAmount}</h1>
            </div>

            <div className="teacher-student-amount">
                <h2 className="teacher-widget-title">Total d'élèves</h2>
                <h1 className="teacher-widget-classes">{this.state.studentAmount}</h1>
            </div>

            <div className="teacher-widget-stats">
                <h2 className="teacher-widget-title">stat</h2>

            </div>


        </div>
    }


}