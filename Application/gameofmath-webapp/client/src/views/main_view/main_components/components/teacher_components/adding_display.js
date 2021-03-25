import {Component} from "react";
import {createClass, getAllClasses} from "../../../../../model/classModel";
import {createStudent, getAllTheStudents} from "../../../../../model/studentModel";
import {PopupMessage} from "../../teacher_display_2.0";
import {StudentDisplay} from "./student_display";
import {createChapter,getAllChapter} from "../../../../../model/chapterModel";
import {createQuiz,getQuizList} from "../../../../../model/quizModel";

export class AddingDisplay extends Component{

    constructor() {
        super();

        this.state = {
            currentStepScreen: null
        }

    }

    componentDidMount() {
        this.setState({
            currentStepScreen: <AddSelectStep redirect={this.props.redirect} openPopup={this.handleOpenPopup}
                                              previous={this.handlePrevious} next={this.handleNext}/>
        })
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
    QUIZ_TEXT = "Un Quiz"

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

                this.props.next(<AddStudentStep redirect={this.props.redirect} openPopup={this.props.openPopup}
                                                closePopup={this.props.closePopup} next={this.props.next}
                                                previous={this.props.previous}/>)

                break
            case this.CLASS_TEXT:

                this.props.next(<AddClassStep redirect={this.props.redirect} openPopup={this.props.openPopup}
                                              closePopup={this.props.closePopup} next={this.props.next}
                                              previous={this.props.previous}/>)
                break
            case this.CHAPTER_TEXT:

                this.props.next(<AddChapterStep redirect={this.props.redirect} openPopup={this.props.openPopup}
                                                closePopup={this.props.closePopup} next={this.props.next}
                                                previous={this.props.previous}/>)
                break
            case this.QUESTION_TEXT:

                this.props.next(<AddQuestionStep redirect={this.props.redirect} openPopup={this.props.openPopup}
                                                closePopup={this.props.closePopup} next={this.props.next}
                                                previous={this.props.previous}/>)

                break
            case this.QUIZ_TEXT:

                this.props.next(<AddQuizStep redirect={this.props.redirect} openPopup={this.props.openPopup}
                                                 closePopup={this.props.closePopup} next={this.props.next}
                                                 previous={this.props.previous}/>)

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

    handleSelectChoice = (event, text,id) => {
        let domObject = document.getElementById(id);
        if(!this.state.currentChoiceDOM){

            domObject.style.backgroundColor = "var(--secondary_color)"

            this.setState({
                currentChoiceDOM :domObject,
                currentChoice: text
            })
        }else{
            this.state.currentChoiceDOM.style.backgroundColor = "var(--primary_color)"
            domObject.style.backgroundColor = "var(--secondary_color)"

            this.setState({
                currentChoiceDOM :domObject,
                currentChoice: text
            })
        }

    }




    render() {
        return <div className="teacher-selection-container">

            <h1 className="teacher-add-choice-title">Ajouter</h1>

            <div className="teacher-selection-option-list">
                <SelectionChoice id="student" onClick={this.handleSelectChoice} title={this.STUDENT_TEXT}  />
                <SelectionChoice id="class" onClick={this.handleSelectChoice} title={this.CLASS_TEXT} />
                <SelectionChoice id="chapter" onClick={this.handleSelectChoice} title={this.CHAPTER_TEXT} />
                <SelectionChoice id="quiz" onClick={this.handleSelectChoice} title={this.QUIZ_TEXT} />
                <SelectionChoice id="question" onClick={this.handleSelectChoice} title={this.QUESTION_TEXT} />

            </div>

            <button onClick={this.handleConfirmChoice} className="teacher-next-btn" >Suivant</button>
        </div>
    }


}

class SelectionChoice extends Component{


    handleClick = (event) =>{
        this.props.onClick(event, this.props.title, this.props.id)
    }


    render() {
        return <div id={this.props.id} onClick={this.handleClick} className="teacher-selection-choice-container">
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
        let selectedClass = document.getElementById("selected-class")
        let login = document.getElementById("select-login")
        let name = document.getElementById("select-name")
        let firstname = document.getElementById("select-firstname")
        if(selectedClass.value === "empty"){
            valid = false
            //TODO custom message error
            alert("Aucunne classe selectionné")
        }

        if(login.value.length < 4){
            valid = false
            //TODO custom message error
            alert("Login - taille minimum de 4")
        }

        if(name.value === ""){
            valid = false
            //TODO custom message error
            alert("Nom - obligatoire")
        }

        if(firstname.value === ""){
            valid = false
            //TODO custom message error
            alert("Prénom - obligatoire")
        }


        if(valid){
            createStudent(selectedClass.value, login.value, name.value, firstname.value).then((response) => {

                if(response.data.returnState === 0){

                    alert("Elève inserer")
                    alert("mot de passe: " + response.data.password)

                    login.value = "";
                    name.value = "";
                    firstname.value = "";

                    console.log(response)
                    //  this.props.redirect(<StudentDisplay formCreate={{studentID:response.data.student.userID, classID:response.data.student.theClass}}/>);
                } else {
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


            <button onClick={this.handlePrevious} className="teacher-previous-btn" >Précédent</button>
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


            <button onClick={this.handlePrevious} className="teacher-previous-btn" >Précédent</button>
        </div>
    }

}

//////////////////////////////////| ADDING CHAPTER |////////////////////////////////////

class AddChapterStep extends Component {


    handleValidate = (event) => {

        let valid = true;
        let name = document.getElementById("select-name").value;


        if (name === "") {
            valid = false
            //TODO custom message error
            alert("Nom - obligatoire")

        }
        if (valid) {
            createChapter(name).then((res) => {

                console.log(res)

            })
        }

        //no reload
        event.preventDefault();

    }

    handlePrevious = () => {
        this.props.previous(<AddSelectStep previous={this.props.previous} next={this.props.next}/>)
    }

    render() {
        return <div className="teacher-add-chapter-step">

            <form className="teacher-chapter-creation-container" onSubmit={this.handleValidate}>

                <input className="teacher-chapter-creation-input" id="select-name" placeholder="Nom" type="text"/>
                <input className="teacher-chapter-creation-valid" type="submit" value="Valider"/>

            </form>


            <button onClick={this.handlePrevious} className="teacher-previous-btn">Précédent</button>
        </div>
    }

}

////////////////////////| ADDING QUESTION |//////////////////////////

class AddQuestionStep extends Component{

    constructor() {
        super();

        this.state = {
            currentChapter: 0,
            chaptersList: [],
            quizList: [],
            currentQuiz: null
        }
    }

    componentDidMount() {
        this.getChapter()
    }

    getChapter = () =>{
        getAllChapter().then((response) => {

            console.log(response)
            this.setState({
                chaptersList:response.data.chapters
            })

        })
    }

    getQuiz = () =>{
        getQuizList(this.state.currentChapter).then((response) => {

            console.log(response)
            this.setState({
                quizList:response.data.quizzes
            })

        })
    }

    handleValidate = (event) => {

        let valid = true;
        let selectedClass = document.getElementById("selected-class")
        let login = document.getElementById("select-login")
        let name = document.getElementById("select-name")
        let firstname = document.getElementById("select-firstname")
        if(selectedClass.value === "empty"){
            valid = false
            //TODO custom message error
            alert("Aucunne classe selectionné")
        }

        if(login.value.length < 4){
            valid = false
            //TODO custom message error
            alert("Login - taille minimum de 4")
        }

        if(name.value === ""){
            valid = false
            //TODO custom message error
            alert("Nom - obligatoire")
        }

        if(firstname.value === ""){
            valid = false
            //TODO custom message error
            alert("Prénom - obligatoire")
        }


        if(valid){
            createStudent(selectedClass.value, login.value, name.value, firstname.value).then((response) => {

                if(response.data.returnState === 0){

                    alert("Elève inserer")
                    alert("mot de passe: " + response.data.password)

                    login.value = "";
                    name.value = "";
                    firstname.value = "";

                    console.log(response)
                    //  this.props.redirect(<StudentDisplay formCreate={{studentID:response.data.student.userID, classID:response.data.student.theClass}}/>);
                } else {
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
                    <option className="teacher-student-creation-option" value="empty">Choix du Chapitre</option>
                    {this.state.chaptersList.map((theChapter, index) => {
                        return <option key={index} value={theChapter.chapterID}>{theChapter.name}</option>
                    })}
                </select>
                <select className="teacher-student-creation-input" id="selected-quiz">
                    <option className="teacher-student-creation-option" value="empty">Choix du Quiz</option>
                    {this.state.quizList.map((theQuiz, index) => {
                        return <option key={index} value={theQuiz.quizID}>{theQuiz.name}</option>
                    })}
                </select>

                <input className="teacher-student-creation-input" id="select-login" placeholder="Login" type="text"/>
                <input className="teacher-student-creation-input" id="select-name" placeholder="Nom" type="text"/>
                <input className="teacher-student-creation-input" id="select-firstname" placeholder="Prénom" type="text"/>
                <input className="teacher-student-creation-valid" type="submit" value="Valider"/>
            </form>


            <button onClick={this.handlePrevious} className="teacher-previous-btn" >Précédent</button>
        </div>
    }

}

//////////////////////////////////| ADDING QUIZ |////////////////////////////////////

class AddQuizStep extends Component{

    constructor() {
        super();

        this.state = {
            currentChapter: 0,
            chaptersList: []
        }
    }

    componentDidMount() {
        this.getChapter()
    }

    getChapter = () =>{
        getAllChapter().then((response) => {

            this.setState({
                chaptersList:response.data.chapters
            })

        })
    }

    handleValidate = (event) => {

        let valid = true;
        let name = document.getElementById("select-name").value
        let isOrder = 1;


        if(name === ""){
            valid = false
            //TODO custom message error
            alert("Nom - obligatoire!")
        }

        if(this.state.currentChapter === null){
            valid = false;
            //TODO custom message error
            alert("Chapitre - obligatoire!")
        }

        console.log(this.state.currentChapter)

        if(valid){
            createQuiz(name,this.state.currentChapter,isOrder).then((res) => {
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

                <select className="teacher-student-creation-input" id="selected-class">
                    <option className="teacher-student-creation-option" value="empty">Choix du Chapitre</option>
                    {this.state.chaptersList.map((theChapter, index) => {
                        return <option key={index} value={theChapter.chapterID}>{theChapter.name}</option>
                    })}
                </select>

                <input className="teacher-student-creation-valid" type="submit" value="Valider"/>
            </form>


            <button onClick={this.handlePrevious} className="teacher-previous-btn" >Précédent</button>
        </div>
    }

}