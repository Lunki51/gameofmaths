import {Component} from "react";
import {createClass, getAllClasses} from "../../../../../model/classModel";
import {createStudent, getAllTheStudents} from "../../../../../model/studentModel";
import {PopupMessage} from "../../teacher_display_2.0";

export class AddingDisplay extends Component{

    constructor() {
        super();

        this.state = {
            currentStepScreen: <AddSelectStep openPopup={this.handleOpenPopup} previous={this.handlePrevious} next={this.handleNext}/>
        }

    }

    handleOpenPopup = (Object) => {
        this.props.openPopup(Object)
    }

    handleNext = (nextStepDOMObject) => {
        this.setState({
            currentStepScreen: nextStepDOMObject
        })
    }

    handlePrevious = (previousDomObject) => {
        this.setState({
            currentStepScreen: previousDomObject
        })
    }



    render() {

        return <div className="teacher-default-dashboard-container">

            <div className="teacher-adding-step-container">
                {this.state.currentStepScreen}
            </div>


        </div>
    }

}

/////////////////////////| SELECTION STEP |///////////////////////

class AddSelectStep extends Component{

    // final variables
    STUDENT_TEXT = "Un élève"
    CLASS_TEXT = "Une classe"
    CHAPTER_TEXT = "Un Chapitre"
    QUESTION_TEXT = "Une Question"

    constructor() {
        super();

        this.state = {
            currentChoice: "",
            currentChoiceDOM:null,
        }
    }


    handleConfirmChoice = () => {

        switch (this.state.currentChoice) {
            case this.STUDENT_TEXT:

                this.props.next(<AddStudentStep openPopup={this.props.openPopup} closePopup={this.props.closePopup}  next={this.props.next} previous={this.props.previous}/>)


                break
            case this.CLASS_TEXT:

                this.props.next(<AddClassStep openPopup={this.props.openPopup} closePopup={this.props.closePopup}  next={this.props.next} previous={this.props.previous} />)
                break
            case this.CHAPTER_TEXT:


                break
            case this.QUESTION_TEXT:


                break
            default:

                this.props.openPopup(<PopupMessage
                    message="Auccune selection"
                    validText="OK"
                    validateCallback={()=>{
                        this.props.closePopup()
                        }
                    }

                />)

                break
        }

    }

    handleSelectChoice = (event, text) => {

        if(!this.state.currentChoiceDOM){
            event.nativeEvent.explicitOriginalTarget.style.backgroundColor = "var(--secondary_color)"

            this.setState({
                currentChoiceDOM :event.nativeEvent.explicitOriginalTarget,
                currentChoice: text
            })
        }else{
            this.state.currentChoiceDOM.style.backgroundColor = "var(--primary_color)"
            event.nativeEvent.explicitOriginalTarget.style.backgroundColor = "var(--secondary_color)"

            this.setState({
                currentChoiceDOM :event.nativeEvent.explicitOriginalTarget,
                currentChoice: text
            })
        }

    }




    render() {
        return <div className="teacher-selection-container">

            <h1 className="teacher-add-choice-title">Ajouter</h1>

            <div className="teacher-selection-option-list">
                <SelectionChoice onClick={this.handleSelectChoice} title={this.STUDENT_TEXT}  />
                <SelectionChoice onClick={this.handleSelectChoice} title={this.CLASS_TEXT} />
                <SelectionChoice onClick={this.handleSelectChoice} title={this.CHAPTER_TEXT} />
                <SelectionChoice onClick={this.handleSelectChoice} title={this.QUESTION_TEXT} />

            </div>

            <button onClick={this.handleConfirmChoice} className="teacher-next-btn" >Suivant</button>
        </div>
    }


}

class SelectionChoice extends Component{


    handleClick = (event) =>{
        this.props.onClick(event, this.props.title)
    }


    render() {
        return <div onClick={this.handleClick} className="teacher-selection-choice-container">
            <h1 className="teacher-selection-choice-text">{this.props.title}</h1>
        </div>
    }


}


////////////////////////| ADDING STUDENT |//////////////////////////


class AddStudentStep extends Component{

    constructor() {
        super();

        this.state = {
            classesList: []
        }
    }

    componentDidMount() {
        this.getClasses()
    }

    getClasses = () =>{
        getAllClasses().then((response) => {

            this.setState({
                classesList:response.data.classes
            })

        })
    }

    handleValidate = (event) => {

        let valid = true;
        let selectedClass = document.getElementById("selected-class").value
        let login = document.getElementById("select-login").value
        let name = document.getElementById("select-name").value
        let firstname = document.getElementById("select-firstname").value

        if(selectedClass === "empty"){
            valid = false
            //TODO custom message error
            alert("Aucunne classe selectionné")
        }

        if(login.length < 4){
            valid = false
            //TODO custom message error
            alert("Login - taille minimum de 4")
        }

        if(name === ""){
            valid = false
            //TODO custom message error
            alert("Nom - obligatoire")
        }

        if(firstname === ""){
            valid = false
            //TODO custom message error
            alert("Prénom - obligatoire")
        }


        if(valid){
            createStudent(selectedClass, login, name, firstname).then((response) => {

                if(response.data.returnState === 0){

                }else{
                    //TODO error msg
                    alert(response.data.msg)
                }

            })
        }



        //no reload
        event.preventDefault();
    }

    handlePrevious = () => {
        this.props.previous(<AddSelectStep previous={this.props.previous} next={this.props.next} />)
    }

    render() {
        return <div className="teacher-add-student-step">

            <form className="teacher-student-creation-container" onSubmit={this.handleValidate}>
                <select className="teacher-student-creation-input" id="selected-class">
                    <option className="teacher-student-creation-option" value="empty">Choix de la classe</option>
                    {this.state.classesList.map((theClass, index) => {
                        return <option key={index} value={theClass.classID}>{theClass.name}</option>
                    })}
                </select>

                <input className="teacher-student-creation-input" id="select-login" placeholder="Login" type="text"/>
                <input className="teacher-student-creation-input" id="select-name" placeholder="Nom" type="text"/>
                <input className="teacher-student-creation-input" id="select-firstname" placeholder="Prénom" type="text"/>
                <input className="teacher-student-creation-valid" type="submit" value="Valider"/>
            </form>


            <button onClick={this.handlePrevious} className="teacher-previous-btn" >Précedent</button>
        </div>
    }

}


//////////////////////////////////| ADDING CLASSES |////////////////////////////////////




class AddClassStep extends Component{


    handleValidate = (event) => {

        let valid = true;
        let name = document.getElementById("select-name").value
        let grade = document.getElementById("select-grade").value


        if(name === ""){
            valid = false
            //TODO custom message error
            alert("Nom - obligatoire!")
        }

        if(grade === ""){
            valid = false
            //TODO custom message error
            alert("Niveau - obligatoire!")
        }


        if(valid){
           createClass(name, grade).then((res) => {

               console.log(res)

           })
        }



        //no reload
        event.preventDefault();
    }

    handlePrevious = () => {
        this.props.previous(<AddSelectStep previous={this.props.previous} next={this.props.next} />)
    }

    render() {
        return <div className="teacher-add-student-step">

            <form className="teacher-student-creation-container" onSubmit={this.handleValidate}>

                <input className="teacher-student-creation-input" id="select-name" placeholder="Nom" type="text"/>
                <input className="teacher-student-creation-input" id="select-grade" placeholder="Niveau" type="text"/>
                <input className="teacher-student-creation-valid" type="submit" value="Valider"/>
            </form>


            <button onClick={this.handlePrevious} className="teacher-previous-btn" >Précedent</button>
        </div>
    }

}