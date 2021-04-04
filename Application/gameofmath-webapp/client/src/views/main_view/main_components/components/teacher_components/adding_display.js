import {Component} from "react";
import {createClass, getAllClasses} from "../../../../../model/classModel";
import {createStudent, getAllStudents, getAllTheStudents} from "../../../../../model/studentModel";
import {StudentDisplay} from "./student_display";
import {createChapter,getAllChapter} from "../../../../../model/chapterModel";
import {addQuestion, createAnswer, createQuiz, deleteQuestion, getQuizList} from "../../../../../model/quizModel";

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
            alert("Aucunne classe selectionné")
        }

        if(login.value.length < 4){
            valid = false
            alert("Login - taille minimum de 4")
        }

        if(name.value === ""){
            valid = false
            alert("Nom - obligatoire")
        }

        if(firstname.value === ""){
            valid = false
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

                    //  this.props.redirect(<StudentDisplay formCreate={{studentID:response.data.student.userID, classID:response.data.student.theClass}}/>);
                } else {
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
            alert("Nom - obligatoire!")
        }

        if(grade === ""){
            valid = false
            alert("Niveau - obligatoire!")
        }


        if(valid){
           createClass(name, grade).then((res) => {

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
            alert("Nom - obligatoire")

        }
        if (valid) {
            createChapter(name).then((res) => {


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
            currentChapter: 1,
            chaptersList: [],
            quizList: [],
            currentQuiz: null,
            answerList: [],
            isValid: false,
            selectedFile: null
        }
    }

    componentDidMount() {

        getAllChapter().then(res => {
            this.setState({
                chaptersList: res.data.chapters,
            })

            getQuizList(res.data.chapters[0].chapterID).then(result => {
                this.setState({
                    quizList: result.data.quizzes
                })

            })
        })

    }

    handleUpdateList = (event) => {

        getAllChapter().then(res => {
            this.setState({
                chapterList: res.data.chapters,
                currentChapter: event.target.value,
            })

            getQuizList(event.target.value).then(result => {
                this.setState({
                    quizList: result.data.quizzes
                })

            })
        })
    }

    handleUpdateQuizList = (event) => {
        this.setState({
            currentQuiz: event.target.value
        })
    }

    handleSwitch = () => {
        let isValid = document.getElementById("toggle-switch")

        if(isValid && isValid.style.backgroundColor === "var(--secondary_color)"){
            isValid.style.backgroundColor = "var(--primary_color)"
            this.setState({
                isValid: true
            })
        }else{
            isValid.style.backgroundColor = "var(--secondary_color)"
            this.setState({
                isValid: false
            })
        }
    }

    handleAddAnswer = () => {
        let answerText = document.getElementById("select-textAnswer").value
        let isValid = !this.state.isValid
        let tab = this.state.answerList

        tab.push({answerText: answerText, isValid: isValid})
        this.setState({
            answerList: tab
        })

    }

    handleDeleteAnswer = (event,theAnswer) => {

        this.setState({
            answerList: this.state.answerList.filter(function(aAnswer, index, arr){
                return aAnswer !== theAnswer;
            })
        })

    }

    handleValidate = (event) => {

        let valid = true;
        let upperText = document.getElementById("select-upperText").value
        let lowerText = document.getElementById("select-lowerText").value
        let image = document.getElementById("select-image").value
        let level = document.getElementById("select-level").value

        let type = 'OPEN'

        if(this.state.answerList.length > 1) {
            let nbValidAnswer = 0
            type = 'QCU'
            this.state.answerList.forEach(answer => {
                if(answer.isValid){
                    nbValidAnswer++
                }
            })
            if(nbValidAnswer > 1){
                type = 'QCM'
            }
        }

        if(valid){
            addQuestion(this.state.currentChapter,this.state.currentQuiz,upperText,lowerText,type,level).then((response) => {
                this.state.answerList.forEach(answer => {
                    createAnswer(this.state.currentQuiz, response.data.question.questionID, answer.answerText, answer.isValid).then(r  =>{
                    })
                })
            })
        }

        //no reload
        event.preventDefault();
    }

    handleFileSelected = (event) => {
        this.setState({
            selectedFile: event.target.files[0]
        })
    }

    handlePrevious = () => {
        this.props.previous(<AddSelectStep previous={this.props.previous} next={this.props.next} />)
    }

    render() {
        return <div className="teacher-add-student-step">

            <form className="teacher-student-creation-container" onSubmit={this.handleValidate}>
                <select onChange={this.handleUpdateList} className="teacher-student-creation-input" id="selected-theChapter">
                    <option className="teacher-student-creation-option" value="empty">Choix du Chapitre</option>
                    {this.state.chaptersList.map((theChapter, index) => {
                        return <option key={index} value={theChapter.chapterID}>{theChapter.name}</option>
                    })}
                </select>
                <select onChange={this.handleUpdateQuizList} className="teacher-student-creation-input" id="selected-theQuiz">
                    <option className="teacher-student-creation-option" value="empty">Choix du Quiz</option>
                    <option className="teacher-student-creation-option" value="noQuiz">Aucun Quiz</option>
                    {this.state.quizList.map((theQuiz, index) => {
                        return <option key={index} value={theQuiz.quizID}>{theQuiz.quizName}</option>
                    })}
                </select>

                <h1 className="teacher-question-creation-text">Création Question</h1>

                <input className="teacher-student-creation-input" id="select-upperText" placeholder="Texte du haut" type="text"/>
                <input onChange={this.handleFileSelected} className="teacher-student-creation-input" id="select-image" placeholder="Image" type="file"/>
                <input className="teacher-student-creation-input" id="select-lowerText" placeholder="Texte du bas" type="text"/>
                <input className="teacher-student-creation-input" id="select-level" placeholder="Difficulté" type="text"/>

                <h1 className="teacher-question-creation-text">Création Réponse</h1>

                <div className="teacher-question-creation-answer">
                    <input className="teacher-student-creation-input-answer" id="select-textAnswer" placeholder="Réponse" type="text"/>
                    <div className="teacher-question-creation-answer-valid" id="toggle-switch" onClick={this.handleSwitch}>
                        <h2 className="teacher-question-creation-answer-is-valid-text" id="select-isValidAnswer">Vrai</h2>
                    </div>
                    <input onClick={this.handleAddAnswer} className="teacher-question-creation-answer-addButton" type="button" value="+"/>

                </div>

                <div className="teacher-question-creation-answer-list">
                    {this.state.answerList.map( (theAnswer, index) => {
                        return <AnswersRow id={theAnswer.answerID} value={theAnswer} onClick={this.handleDeleteAnswer} key={index} theAnswer={theAnswer}/>
                 })}
                </div>

                <br/>
                <br/>

                <input className="teacher-student-creation-valid" type="submit" value="Valider"/>
            </form>



            <button onClick={this.handlePrevious} className="teacher-previous-btn" >Précédent</button>
        </div>
    }

}

class AnswersRow extends Component{

    handleClick = (event) => {
        this.props.onClick(event,this.props.theAnswer)
    }

    render() {
        return <div onClick={this.handleClick} id={this.props.id} className="teacher-chapter-row">
            <h1 className="teacher-chapter-row-title">{this.props.theAnswer.answerText}</h1>
        </div>
    }

}

//////////////////////////////////| ADDING QUIZ |////////////////////////////////////

class AddQuizStep extends Component{

    constructor() {
        super();

        this.state = {
            currentChapter: 0,
            chaptersList: [],
            isOrder: false
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

    handleSwitch = () => {
        let isOrder = document.getElementById("toggle-switch")

        if(isOrder && isOrder.style.backgroundColor === "var(--secondary_color)"){
            isOrder.style.backgroundColor = "var(--primary_color)"
            this.setState({
                isOrder: true
            })
        }else{
            isOrder.style.backgroundColor = "var(--secondary_color)"
            this.setState({
                isOrder: false
            })
        }
    }

    handleValidate = (event) => {

        let valid = true;
        let name = document.getElementById("select-name").value
        let isOrder = '1';


        if(name === ""){
            valid = false
            alert("Nom - obligatoire!")
        }

        if(this.state.isOrder){
            isOrder = '1'
        }else if(!this.state.isOrder){
            isOrder = '0'
        }else{
            valid = false;
        }

        if(this.state.currentChapter === null){
            valid = false;
            alert("Chapitre - obligatoire!")
        }

        if(valid){
            createQuiz(name,this.state.currentChapter,isOrder).then((res) => {
            })
        }

        //no reload
        event.preventDefault();
    }

    handleUpdateList = (event) => {

        getAllChapter((event) ? event.target.value : this.state.currentChapter).then(res => {

            this.setState({
                chaptersList: res.data.chapters,
                currentChapter: (event) ? event.target.value : this.state.currentChapter
            })

        })

    }

    handlePrevious = () => {
        this.props.previous(<AddSelectStep previous={this.props.previous} next={this.props.next} />)
    }

    render() {
        return <div className="teacher-add-student-step">

            <form className="teacher-student-creation-container" onSubmit={this.handleValidate}>

                <input className="teacher-student-creation-input" id="select-name" placeholder="Nom" type="text"/>

                <select onChange={this.handleUpdateList} className="teacher-student-creation-input" id="selected-class">
                    <option className="teacher-student-creation-option" value="empty">Choix du Chapitre</option>
                    {this.state.chaptersList.map((theChapter, index) => {
                        return <option key={index} value={theChapter.chapterID}>{theChapter.name}</option>
                    })}
                </select>
                <div className="teacher-question-creation-quiz-order" id="toggle-switch" onClick={this.handleSwitch}>
                    <h2 className="teacher-question-creation-answer-is-valid-text" id="select-isValidAnswer">Est Ordonné</h2>
                </div>

                <br/>
                <br/>

                <input className="teacher-student-creation-valid" type="submit" value="Valider"/>
            </form>


            <button onClick={this.handlePrevious} className="teacher-previous-btn" >Précédent</button>
        </div>
    }

}