import {Component} from "react";
import '../../../styles/teacher_style.css';
import {StudentManagement} from "./StudentManagement";

export class ClassDisplay extends Component{





    render() {

        return <div className="class-data-container">
            <label className="class-title-data">{this.props.theClass.name}</label>
            <StudentManagement theClass={this.props.theClass}/>
        </div>


    }


}