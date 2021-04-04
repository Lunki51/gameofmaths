import React, {Component} from "react";
import '../styles/teacher_style20.css';
import '../styles/global_variables.css';
import {DefaultDisplay} from "./components/teacher_components/default_display";
import {ClassesDisplay} from "./components/teacher_components/classes_display";
import {SearchDisplay} from "./components/teacher_components/search_display";
import {StudentDisplay} from "./components/teacher_components/student_display";
import {AddingDisplay} from "./components/teacher_components/adding_display";
import {DeleteDisplay} from "./components/teacher_components/delete_display";
import {EditDisplay} from "./components/teacher_components/edit_display";
import {QuestionDisplay} from "./components/teacher_components/question_display";
import {SettingsDisplay} from "./components/teacher_components/settings_display";


export class TeacherDisplay20 extends Component{


    constructor(props) {
        super(props);

        document.title = "Dashboard | Game Of Math"

        this.state = {
            currentDisplay : <DefaultDisplay/>,
            hoverElement: null,
            msgElement: null,
        }
    }


    ////////////////| TEACHER ROUTER |//////////////

    handleGotoDefault = () => {
        this.setState({currentDisplay: <DefaultDisplay/> })
    }

    handleGotoClasses = () =>{
        this.setState({currentDisplay: <ClassesDisplay/>})
    }

    handleGotoStudents = () => {
        this.setState({currentDisplay: <StudentDisplay/>})
    }
    handleGotoAdding = () => {
        this.setState({currentDisplay: <AddingDisplay errorOpen={this.props.displayError} waringOpen={this.props.displayWarning} redirect={this.handleRedirectTo} />})
    }

    handleGotoDelete = () => {
        this.setState({currentDisplay: <DeleteDisplay errorOpen={this.props.displayError} waringOpen={this.props.displayWarning} redirect={this.handleRedirectTo} />})
    }

    handleGotoQuestion = () => {
        this.setState({currentDisplay: <QuestionDisplay redirect={this.handleRedirectTo} openPopup={this.handleCreatePopup} closePopup={this.handleDismissPopup}/>})
    }

    handleGotoEdit = () => {
        this.setState({currentDisplay: <EditDisplay errorOpen={this.props.displayError} waringOpen={this.props.displayWarning} redirect={this.handleRedirectTo} />})
    }

    handleGotoSettings = () =>{
        this.setState({currentDisplay: <SettingsDisplay errorOpen={this.props.displayError} waringOpen={this.props.displayWarning} redirect={this.handleRedirectTo} />})
    }



    handleRedirectTo = (goalElement) =>{

        console.log(goalElement)

        this.setState({
                currentDisplay: goalElement
            })

    }

    ////////////////////////////////////////////////

    handleOpenSearch = () => {
        this.setState({hoverElement: <SearchDisplay errorOpen={this.props.displayError} waringOpen={this.props.displayWarning} redirect={this.handleRedirectTo} dismiss={this.handleDismissHoverElement}/>})
    }

    handleDismissHoverElement = () => {
        this.setState({hoverElement:null})
    }

    render() {
        return <div className="background">

            {/*///////////////////| DESKTOP VIEW |////////////////////*/}

            <div className="teacher-logo-container">
                <img className="teacher-GOM-logo" src={window.location.origin + "/logo/game_of_math_logo.png"} alt="logo"/>
            </div>


            <nav className="teacher-nav-container">

                <NavElement typeClass="teacher-nav-element-stack-top" iconURL="https://img.icons8.com/ios/55/ffffff/dashboard.png" title="Dashboard" onClick={this.handleGotoDefault}/>
                <NavElement typeClass="teacher-nav-element-stack-top" iconURL="https://img.icons8.com/dotty/55/ffffff/class.png" title="Classes" onClick={this.handleGotoClasses}/>
                <NavElement typeClass="teacher-nav-element-stack-top" iconURL="https://img.icons8.com/ios/55/ffffff/student-male--v1.png" title="Élèves" onClick={this.handleGotoStudents}/>
                <NavElement typeClass="teacher-nav-element-stack-top" iconURL="https://img.icons8.com/ios/55/ffffff/question-mark--v1.png" title="Questions" onClick={this.handleGotoQuestion}/>
                <NavElement typeClass="teacher-nav-element-stack-top" iconURL="https://img.icons8.com/ios/55/ffffff/add-column.png" title="Ajouter" onClick={this.handleGotoAdding}/>
                <NavElement typeClass="teacher-nav-element-stack-top" iconURL="https://img.icons8.com/ios/55/ffffff/add-trash.png" title="Supprimer" onClick={this.handleGotoDelete}/>
                <NavElement typeClass="teacher-nav-element-stack-top" iconURL="https://img.icons8.com/ios/55/ffffff/edit--v1.png" title="Éditer" onClick={this.handleGotoEdit}/>
                <NavElement typeClass="teacher-nav-element-stack-top" iconURL="https://img.icons8.com/ios/55/ffffff/search--v1.png" title="Rechercher" onClick={this.handleOpenSearch}/>

                <NavElement typeClass="teacher-nav-element-stack-bottom" iconURL="https://img.icons8.com/fluent-systems-regular/55/ffffff/settings.png" title="Paramètres" onClick={this.handleGotoSettings}/>
                <NavElement typeClass="teacher-nav-element-stack-bottom" iconURL="https://img.icons8.com/fluent-systems-regular/55/ffffff/logout-rounded-left.png" title="Déconnexion" onClick={this.props.logout}/>


            </nav>


            {/*///////////////////| MOBILE VIEW |////////////////////*/}





            {/*///////////////////////| GLOBAL VIEW |//////////////////////*/}

            {this.state.currentDisplay}
            {this.state.hoverElement}

        </div>

    }


}



class NavElement extends Component{

    render() {

        return <div onClick={this.props.onClick} className={this.props.typeClass} >

            <img className="teacher-nav-element-icon" src={this.props.iconURL} alt={"icon:"+this.props.title}/>
            <h3 className="teacher-nav-element-title" >{this.props.title}</h3>

        </div>

    }

}
