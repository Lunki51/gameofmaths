import React, {Component} from "react";
import {PopupMessage} from "../../teacher_display_2.0";
import {getAllClasses, regenerateMap, updateTheClass} from "../../../../../model/classModel";
import {
    createStudent,
    getAllStudents,
    reg,
    regeneratePassword, updateStudentFirstName, updateStudentlastName,
    updateStudentlogin
} from "../../../../../model/studentModel";


export class EditDisplay extends Component {

    constructor() {
        super();

        this.state = {
            currentStepScreen: <EditSelectStep openPopup={this.handleOpenPopup} previous={this.handlePrevious}
                                               next={this.handleNext}/>
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


class EditSelectStep extends Component {

    // static variables
    STUDENT_TEXT = "Un élève"
    CLASS_TEXT = "Une classe"
    CHAPTER_TEXT = "Un Chapitre"
    QUESTION_TEXT = "Une Question"
    QUIZ_TEXT = "Un Quiz"

    constructor() {
        super();

        this.state = {
            currentChoice: "",
            currentChoiceDOM: null,

        }
    }

    handleConfirmChoice = () => {

        switch (this.state.currentChoice) {
            case this.STUDENT_TEXT:

                this.props.next(<EditStudentStep openPopup={this.props.openPopup} closePopup={this.props.closePopup}
                                                 next={this.props.next} previous={this.props.previous}/>)
                break
            case this.CLASS_TEXT:

                this.props.next(<EditClassStep openPopup={this.props.openPopup} closePopup={this.props.closePopup}
                                               next={this.props.next} previous={this.props.previous}/>)
                break
            case this.CHAPTER_TEXT:

                break
            case this.QUESTION_TEXT:


                break
            case this.QUIZ_TEXT:


                break
            default:

                this.props.openPopup(<PopupMessage
                    message="Aucune selection"
                    validText="OK"
                    validateCallback={() => {
                        this.props.closePopup()
                    }
                    }

                />)

                break
        }

    }

    handleSelectChoice = (event, text, id) => {
        let domObject = document.getElementById(id);
        if (!this.state.currentChoiceDOM) {

            domObject.style.backgroundColor = "var(--secondary_color)"

            this.setState({
                currentChoiceDOM: domObject,
                currentChoice: text
            })
        } else {
            this.state.currentChoiceDOM.style.backgroundColor = "var(--primary_color)"
            domObject.style.backgroundColor = "var(--secondary_color)"

            this.setState({
                currentChoiceDOM: domObject,
                currentChoice: text
            })
        }

    }


    render() {
        return <div className="teacher-selection-container">

            <h1 className="teacher-add-choice-title">Edition</h1>

            <div className="teacher-selection-option-list">
                <SelectionChoice id="student" onClick={this.handleSelectChoice} title={this.STUDENT_TEXT}/>
                <SelectionChoice id="class" onClick={this.handleSelectChoice} title={this.CLASS_TEXT}/>
                <SelectionChoice id="chapter" onClick={this.handleSelectChoice} title={this.CHAPTER_TEXT}/>
                <SelectionChoice id="question" onClick={this.handleSelectChoice} title={this.QUESTION_TEXT}/>
                <SelectionChoice id="quiz" onClick={this.handleSelectChoice} title={this.QUIZ_TEXT}/>

            </div>

            <button onClick={this.handleConfirmChoice} className="teacher-next-btn">Suivant</button>
        </div>
    }


}


class SelectionChoice extends Component {


    handleClick = (event) => {
        this.props.onClick(event, this.props.title, this.props.id)
    }


    render() {
        return <div id={this.props.id} onClick={this.handleClick} className="teacher-selection-choice-container">
            <h1 className="teacher-selection-choice-text">{this.props.title}</h1>
        </div>
    }


}

////////////////////////| EDIT STUDENT |//////////////////////////

export class EditStudentStep extends Component {

    constructor() {
        super();

        this.state = {
            currentStudent: null,
            studentList: [],
            currentClass: 0,
            classesList: []
        }
    }

    componentDidMount() {

        getAllClasses().then(res => {
            this.setState({
                classesList: res.data.classes
            })

            getAllStudents(res.data.classes[0].classID).then(res => {

                if (this.props.formCreate) {
                    this.setState({
                        studentList: res.data.students,
                        currentClass: this.props.formCreate.theClass,
                        currentStudent: this.props.formCreate.theStudent
                    })
                } else {
                    this.setState({
                        studentList: res.data.students
                    })
                }


            })
        })

    }

    handleDisplayOverView = (theStudent) => {
        this.setState({
            currentStudent: theStudent
        })

    }

    handleUpdateList = (event) => {

        getAllStudents((event) ? event.target.value : this.state.currentClass).then(res => {

            this.setState({
                studentList: res.data.students,
                currentClass: (event) ? event.target.value : this.state.currentClass
            })

        })

    }

    handleValidate = (event) => {

        let valid = true;
        let selectedClass = this.state.currentClass
        let login = document.getElementById("select-login").value
        let name = document.getElementById("select-name").value
        let firstname = document.getElementById("select-firstname").value

        if (selectedClass === "empty") {
            valid = false
            //TODO custom message error
            alert("Aucunne classe selectionné")
        }

        if (login.length < 4) {
            valid = false
            //TODO custom message error
            alert("Login - taille minimum de 4")
        }

        if (name === "") {
            valid = false
            //TODO custom message error
            alert("Nom - obligatoire")
        }

        if (firstname === "") {
            valid = false
            //TODO custom message error
            alert("Prénom - obligatoire")
        }


        if (valid) {
            if(this.props.theStudent.login !== this.state.login) updateStudentlogin(selectedClass, (event) ? event.target.value : this.state.currentClass, login).then((response) => {

                console.log(response)

            })
            if(this.props.theStudent.lastname !== this.state.lastname) updateStudentlastName(selectedClass, (event) ? event.target.value : this.state.currentClass, name).then((response) => {

                console.log(response)

            })
            if(this.props.theStudent.firstname !== this.state.firstname) updateStudentFirstName(selectedClass, (event) ? event.target.value : this.state.currentClass, firstname).then((response) => {
                console.log(response)
            })
        }

        //no reload
        event.preventDefault();
    }

    handleRegenerate = (event) => {

        regeneratePassword(this.state.currentClass, this.state.currentStudent.data.login, this.state.currentStudent.data.lastname, this.state.currentStudent.data.firstname).then((res) => {
            console.log(res)
        })
        //no reload
        event.preventDefault();
    }

    render() {
        return <div className="teacher-default-dashboard-container">

            <div className="teacher-class-list-editStudent-overview">

                <select onChange={this.handleUpdateList} className="teacher-student-creation-input" id="selected-class">
                    {this.state.classesList.map((theClass, index) => {
                        return <option key={index} value={theClass.classID}>{theClass.name}</option>
                    })}
                </select>

                {(this.state.studentList.length > 0) ? this.state.studentList.map((theStudent, index) => {
                    console.log(theStudent)
                    return <StudentRow onClick={this.handleDisplayOverView} value={theStudent}
                                       callbackOverView={this.handleDisplayOverView} key={index}/>
                }) : <h1 className="teacher-student-list-none">Aucun Elève</h1>}

            </div>

            <div className="teacher-class-editStudent-overview">

                {(this.state.currentStudent) ? <StudentEditOverview theStudent={this.state.currentStudent}/> :
                    <h1 className="teacher-no-class">Aucun élève selectionné</h1>}

            </div>

            <button onClick={this.handlePrevious} className="teacher-previous-editStudent-btn">Précédent</button>
        </div>
    }


}


class StudentRow extends Component {


    handleClick = () => {
        this.props.onClick(this.props.value)
    }


    render() {
        return <div onClick={this.handleClick} className="teacher-class-row">
            <h1 className="teacher-class-row-title">{this.props.value.lastname}</h1>
        </div>
    }

}

class StudentEditOverview extends Component {

    constructor() {
        super();

        this.state = {
            login: "",
            lastname: "",
            firstname: ""
        }
    }

    componentDidMount() {
        this.setState({
            login: this.props.theStudent.login,
            lastname: this.props.theStudent.lastname,
            firstname: this.props.theStudent.firstname
        })
    }

    handleOnChangeLogin = (event) => {
        this.setState({
            login: event.target.value
        })
    }

    handleOnChangeName = (event) => {
        this.setState({
            lastname: event.target.value
        })
    }

    handleOnChangeFirstname = (event) => {
        this.setState({
            firstname: event.target.value
        })
    }

    componentWillReceiveProps(nextProps) {

        this.setState({
            login: nextProps.theStudent.login,
            lastname: nextProps.theStudent.lastname,
            firstname: nextProps.theStudent.firstname
        })

    }

    render() {
        return <div className="teacher-edit-student-step">

            <form className="teacher-edit-creation-container" onSubmit={this.handleValidate}>
                <input onChange={this.handleOnChangeLogin} className="teacher-student-edit-input" id="select-login"
                       placeholder="Login" type="text"
                       value={this.state.login}/>
                <input onChange={this.handleOnChangeName} className="teacher-student-edit-input" id="select-name"
                       placeholder="Nom" type="text"
                       value={this.state.lastname}/>
                <input onChange={this.handleOnChangeFirstname} className="teacher-student-edit-input"
                       id="select-firstname" placeholder="Prénom" type="text"
                       value={this.state.firstname}/>
                <button onClick={this.handleRegenerate} className="teacher-regenerate-btn">Regénérer la mot de passe
                </button>

                <input className="teacher-student-creation-valid" type="submit" value="Valider"/>
            </form>

        </div>
    }
}

////////////////////////| EDIT CHAPTER |//////////////////////////



////////////////////////| EDIT CLASS |//////////////////////////

class EditClassStep extends Component {

    constructor() {
        super();

        this.state = {
            currentClass: {name: "", grade: ""},
            classesList: []
        }
        this.handleUpdateList()
    }

    handleValidate = (event) => {

        let valid = true;
        let name = document.getElementById("select-name").value
        let grade = document.getElementById("select-grade").value


        if (name === "") {
            valid = false
            //TODO custom message error
            alert("Nom - obligatoire!")
        }

        if (grade === "") {
            valid = false
            //TODO custom message error
            alert("Niveau - obligatoire!")
        }


        if (valid) {
            console.log(this.state.currentClass,name,grade)
            updateTheClass(this.state.currentClass, name, grade).then((res) => {
                console.log(res)
            })
        }

        //no reload
        event.preventDefault();
    }

    handlePrevious = () => {
        this.props.previous(<EditSelectStep previous={this.props.previous} next={this.props.next}/>)
    }

    handleRegenerate = (event) => {

        regenerateMap(this.state.currentClass).then((res) => {
            console.log(res)
        })
        //no reload
        event.preventDefault();
    }

    handleOnChange = (event) => {
        this.state.classesList.forEach((theClass) => {
            console.log(event.target.value)
            if (theClass.classID === event.target.value) {
                console.log("allo")
                this.setState({
                    currentClass:{name: theClass.name, grade:theClass.grade}
                })
            }
        })
        //no reload
        event.preventDefault();
    }

    handleUpdateList = () => {

        getAllClasses().then(res => {
            this.setState({
                classesList: res.data.classes,
                currentClass: res.data.classes[0]
            })
        })

    }

    handleOnChangeName = (event) => {
        this.setState({
            currentClass:{name: event.target.value}
        })
    }

    handleOnChangeGrade = (event) => {
        this.setState({
            currentClass:{grade: event.target.value}
        })
    }

    componentWillReceiveProps(nextProps) {

        this.setState({
            currentClass:{name: nextProps.currentClass.name,grade: nextProps.currentClass.grade}
        })

    }

    render() {
        return <div className="teacher-add-student-step">

            <form className="teacher-student-creation-container" onSubmit={this.handleValidate}>

                <select onChange={this.handleOnChange} className="teacher-student-creation-input" id="selected-class">
                    {this.state.classesList.map((theClass, index) => {
                        return <option key={index} value={theClass.classID}>{theClass.name}</option>
                    })}
                </select>

                <input onChange={this.handleOnChangeName} className="teacher-student-creation-input" id="select-name" placeholder="Nom" type="text"
                       value={this.state.currentClass.name}/>
                <input onChange={this.handleOnChangeGrade} className="teacher-student-creation-input" id="select-grade" placeholder="Niveau" type="text"
                       value={this.state.currentClass.grade}/>
                <input onClick={this.handleValidate} className="teacher-student-creation-valid" type="submit"
                       value="Valider"/>
                <button onClick={this.handleRegenerate} className="teacher-regenerate-btn">Regénéré la carte</button>
            </form>


            <button onClick={this.handlePrevious} className="teacher-previous-btn">Précédent</button>
        </div>
    }

}
