import {Component} from "react";
import '../styles/teacher_style20.css';
import '../styles/global_variables.css';
import {DefaultDisplay} from "./components/teacher_components/default_display";
import {ClassesDisplay} from "./components/teacher_components/classes_display";
import {SearchDisplay} from "./components/teacher_components/search_display";
import {StudentDisplay} from "./components/teacher_components/student_display";
import {AddingDisplay} from "./components/teacher_components/adding_display";
import {DeleteDisplay} from "./components/teacher_components/delete_display";
import {EditDisplay} from "./components/teacher_components/edit_display";


export class TeacherDisplay20 extends Component{


    constructor() {
        super();

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
        this.setState({currentDisplay: <AddingDisplay redirect={this.handleRedirectTo}  openPopup={this.handleCreatePopup} closePopup={this.handleDismissPopup}/>})
    }

    handleGotoDelete = () => {
        this.setState({currentDisplay: <DeleteDisplay redirect={this.handleRedirectTo} openPopup={this.handleCreatePopup} closePopup={this.handleDismissPopup}/>})
    }

    handleGotoEdit = () => {
        this.setState({currentDisplay: <EditDisplay redirect={this.handleRedirectTo} openPopup={this.handleCreatePopup} closePopup={this.handleDismissPopup}/>})
    }

    handleRedirectTo(goalElement){
        this.setState({currentDisplay: goalElement})
    }

    ////////////////////////////////////////////////

    handleOpenSearch = () => {
        this.setState({hoverElement: <SearchDisplay dismiss={this.handleDismissHoverElement}/>})
    }

    handleDismissHoverElement = () => {
        this.setState({hoverElement:null})
    }


    handleCreatePopup = (PopupMessageObject) => {
        this.setState({
            msgElement: PopupMessageObject
        })
    }

    handleDismissPopup = () => {
        this.setState({msgElement:null})
    }

    render() {
        return <div className="background">

            {/*///////////////////| DESKTOP VIEW |////////////////////*/}
            <div className="teacher-logo-container">
                <img className="teacher-GOM-logo" src={window.location.origin + "/logo/game_of_math_logo.png"}/>
            </div>




            <nav className="teacher-nav-container">

                <NavElement typeClass="teacher-nav-element-stack-top" iconURL="https://img.icons8.com/ios/55/ffffff/dashboard.png" title="Dashboard" onClick={this.handleGotoDefault}/>
                <NavElement typeClass="teacher-nav-element-stack-top" iconURL="https://img.icons8.com/dotty/55/ffffff/class.png" title="Classes" onClick={this.handleGotoClasses}/>
                <NavElement typeClass="teacher-nav-element-stack-top" iconURL="https://img.icons8.com/ios/55/ffffff/student-male--v1.png" title="Élèves" onClick={this.handleGotoStudents}/>
                <NavElement typeClass="teacher-nav-element-stack-top" iconURL="https://img.icons8.com/ios/55/ffffff/question-mark--v1.png" title="Questions"/>
                <NavElement typeClass="teacher-nav-element-stack-top" iconURL="https://img.icons8.com/ios/55/ffffff/add-column.png" title="Ajouter" onClick={this.handleGotoAdding}/>
                <NavElement typeClass="teacher-nav-element-stack-top" iconURL="https://img.icons8.com/ios/55/ffffff/add-trash.png" title="Supprimer" onClick={this.handleGotoDelete}/>
                <NavElement typeClass="teacher-nav-element-stack-top" iconURL="https://img.icons8.com/ios/55/ffffff/edit--v1.png" title="Éditer" onClick={this.handleGotoEdit}/>
                <NavElement typeClass="teacher-nav-element-stack-top" iconURL="https://img.icons8.com/ios/55/ffffff/search--v1.png" title="Rechercher" onClick={this.handleOpenSearch}/>

                <NavElement typeClass="teacher-nav-element-stack-bottom" iconURL="https://img.icons8.com/fluent-systems-regular/55/ffffff/settings.png" title="Paramètres"/>
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

            <img className="teacher-nav-element-icon" src={this.props.iconURL}/>
            <h3 className="teacher-nav-element-title" >{this.props.title}</h3>

        </div>

    }

}


export class PopupMessage extends Component{

    render() {

        return <div className="dim-background">
                    <div className="teacher-popup-message-container">
                        <div className="teacher-popup-message-limit">
                            <p>
                                {this.props.message}
                            </p>
                        </div>

                        <div className="teacher-popup-message-btn-section">
                            <button className="teacher-popup-message-btn-valid" onClick={this.props.validateCallback}>{this.props.validText}</button>

                            {(this.props.cancelText)?<button className="teacher-popup-message-btn-cancel" onClick={this.props.cancelCallback}>{this.props.cancelText}</button>:
                            null}
                        </div>

                    </div>
                </div>
    }
}