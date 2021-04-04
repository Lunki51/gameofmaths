import React, {Component} from "react";
import {getAllClasses, regenerateMap, updateTheClass} from "../../../../../model/classModel";
import {
    getAllStudents,
    regeneratePassword, updateStudentFirstName, updateStudentlastName,
    updateStudentlogin
} from "../../../../../model/studentModel";
import {deleteChapter, getAllChapter, updateChapterName} from "../../../../../model/chapterModel";
import {
    addQuestion,
    createAnswer, deleteAnswersOfQuestion, deleteImage,
    deleteQuestion, deleteQuiz, getAnswersList,
    getQuestion,
    getQuestionList,
    getQuizList, setImage, setQuizName, setQuizOrdered, updateQuestion
} from "../../../../../model/quizModel";


export class EditDisplay extends Component {

    constructor(props) {
        super(props);

        this.state = {
            currentStepScreen: <EditSelectStep openWaring={props.waringOpen} openError={props.errorOpen}
                                               previous={this.handlePrevious}
                                               next={this.handleNext}/>
        }

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
                this.props.next(<EditChapterStep openPopup={this.props.openPopup} closePopup={this.props.closePopup}
                                                 next={this.props.next} previous={this.props.previous}/>)
                break
            case this.QUESTION_TEXT:
                this.props.next(<EditQuestionSelectStep openPopup={this.props.openPopup}
                                                        closePopup={this.props.closePopup}
                                                        next={this.props.next} previous={this.props.previous}/>)
                break
            case this.QUIZ_TEXT:
                this.props.next(<EditQuizListStep openPopup={this.props.openPopup}
                                                        closePopup={this.props.closePopup}
                                                        next={this.props.next} previous={this.props.previous}/>)

                break
            default:

                this.props.openError("Aucun choix n'a été sectionné")

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

            getAllStudents(res.data.classes[0].classID).then(res2 => {

                if (this.props.formCreate) {
                    this.setState({
                        studentList: res2.data.students,
                        currentClass: this.props.formCreate.theClass,
                        currentStudent: this.props.formCreate.theStudent
                    })
                } else {
                    this.setState({
                        studentList: res2.data.students,
                        currentClass: res.data.classes[0].classID,
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

    handleClearSelected = () => {
        this.setState({currentStudent: null})
        this.handleUpdateList({target: {value: this.state.currentClass}})
    }

    handlePrevious = () => {
        this.props.previous(<EditSelectStep previous={this.props.previous} next={this.props.next}/>)
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
                    return <StudentRow onClick={this.handleDisplayOverView} value={theStudent}
                                       callbackOverView={this.handleDisplayOverView} key={index}/>
                }) : <h1 className="teacher-student-list-none">Aucun Elève</h1>}

            </div>

            <div className="teacher-class-editStudent-overview">

                {(this.state.currentStudent) ?
                    <StudentEditOverview theStudent={this.state.currentStudent} previous={this.props.previous}
                                         next={this.props.next} clear={this.handleClearSelected}/> :
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

    handleValidate = (event) => {

        let valid = true;
        let selectedClass = this.state.currentClass
        let login = document.getElementById("select-login").value
        let name = document.getElementById("select-name").value
        let firstname = document.getElementById("select-firstname").value

        if (selectedClass === "empty") {
            valid = false
            alert("Aucune classe selectionné")
        }

        if (login.length < 4) {
            valid = false
            alert("Login - taille minimum de 4")
        }

        if (name === "") {
            valid = false
            alert("Nom - obligatoire")
        }

        if (firstname === "") {
            valid = false
            alert("Prénom - obligatoire")
        }


        if (valid) {
            if (this.props.theStudent.login !== this.state.login) updateStudentlogin(selectedClass, (event) ? event.target.value : this.state.currentClass, login).then((response) => {


            })
            if (this.props.theStudent.lastname !== this.state.lastname) updateStudentlastName(selectedClass, (event) ? event.target.value : this.state.currentClass, name).then((response) => {


            })
            if (this.props.theStudent.firstname !== this.state.firstname) updateStudentFirstName(selectedClass, (event) ? event.target.value : this.state.currentClass, firstname).then((response) => {

            })
        }


        //no reload
        event.preventDefault();
        //this.props.previous(<EditSelectStep previous={this.props.previous} next={this.props.next} />)
        //OR
        this.props.clear();

    }

    handleRegenerate = (event) => {
        regeneratePassword(this.props.theStudent.theClass, this.props.theStudent.userID).then(response => {
            if (response.data.returnState === 0) {
                alert("Le nouveau mot de passe est " + response.data.password)
            }
        })
        event.preventDefault();
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
                <button onClick={this.handleRegenerate} className="teacher-regenerate-btn">Regénérer le mot de passe
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
            currentClass: {name: "", grade: "", classID: 0},
            classesList: []
        }

    }

    componentDidMount(){
        this.handleUpdateList()
    }


    handleValidate = (event) => {

        let valid = true;
        let name = document.getElementById("select-name").value
        let grade = document.getElementById("select-grade").value


        if (name === "") {
            valid = false
            alert("Nom - obligatoire!")
        }

        if (grade === "") {
            valid = false
            alert("Niveau - obligatoire!")
        }


        if (valid) {
            let responses = updateTheClass(this.state.currentClass.classID, name, grade)
            responses.name.then((res) => {
                if (res.data.returnState != 0) alert("Erreur")
            })
            responses.grade.then((res) => {
                if (res.data.returnState != 0) alert("Erreur")
            })
        }

        //no reload
        event.preventDefault();
        this.props.previous(<EditSelectStep previous={this.props.previous} next={this.props.next}/>)
        //OR
        //alert("Modifié avec succès")
    }

    handlePrevious = () => {
        this.props.previous(<EditSelectStep previous={this.props.previous} next={this.props.next}/>)
    }

    handleRegenerate = (event) => {

        regenerateMap(this.state.currentClass.classID).then((res) => {
            if (res.data.returnState === 0) {
                alert("Map régénérée avec succès")
            }
        })
        //no reload
        event.preventDefault();
    }

    handleOnChange = (event) => {
        this.state.classesList.forEach((theClass) => {
            if (theClass.classID == event.target.value) {
                this.setState({
                    currentClass: {name: theClass.name, grade: theClass.grade, classID: theClass.classID}
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
        let currentClass = this.state.currentClass;
        currentClass.name = event.target.value;
        this.setState({
            currentClass: currentClass
        })
    }

    handleOnChangeGrade = (event) => {
        let currentClass = this.state.currentClass;
        currentClass.grade = event.target.value;
        this.setState({
            currentClass: currentClass
        })
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            currentClass: {
                name: nextProps.currentClass.name,
                grade: nextProps.currentClass.grade,
                classID: nextProps.currentClass.classID
            }
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

                <input onChange={this.handleOnChangeName} className="teacher-student-creation-input" id="select-name"
                       placeholder="Nom" type="text"
                       value={this.state.currentClass.name}/>
                <input onChange={this.handleOnChangeGrade} className="teacher-student-creation-input" id="select-grade"
                       placeholder="Niveau" type="text"
                       value={this.state.currentClass.grade}/>
                <input className="teacher-student-creation-valid" type="submit"
                       value="Valider"/>
                <button onClick={this.handleRegenerate} className="teacher-regenerate-btn">Régénérer la carte</button>
            </form>


            <button onClick={this.handlePrevious} className="teacher-previous-btn">Précédent</button>
        </div>
    }

}

///////////////////////| EDIT CHAPTER |/////////////////////////

class EditChapterStep extends Component {


    constructor() {
        super();

        this.state = {
            currentChoiceDOM: null,
            currentChapterID: -1,
            chaptersList: [],
            edit: false
        }
    }

    handleGetChapters = () => {


        getAllChapter().then((response) => {
            this.setState({
                chaptersList: response.data.chapters
            })
            this.setState({edit: false})

        })

    }

    componentDidMount() {
        this.handleGetChapters()
    }


    handleSelectChoice = (event, chapterId, id) => {
        if (!this.state.edit) {
            let domObject = document.getElementById(id);
            if (!this.state.currentChoiceDOM) {

                domObject.style.backgroundColor = "var(--secondary_color)"

                this.setState({
                    currentChoiceDOM: domObject,
                    currentChapterID: chapterId
                })
            } else {
                this.state.currentChoiceDOM.style.backgroundColor = "var(--primary_color)"
                domObject.style.backgroundColor = "var(--secondary_color)"

                this.setState({
                    currentChoiceDOM: domObject,
                    currentChapterID: chapterId
                })
            }
        }
    }

    handleValidate = (event) => {
        if (this.state.edit) {
            let valid = true;
            let name = document.getElementById("edit-name").value
            if (name === "") {
                valid = false
                alert("Nom - obligatoire!")
            }
            if (valid) {
                updateChapterName(this.state.currentChapterID, name).then(res => {
                    if (res.data.returnState !== 0) alert("Error")
                    this.handleGetChapters()
                })
            }
        } else {
            if (this.state.currentChapterID !== -1) {
                this.setState({edit: true})
            }
        }

    }

    handlePrevious = () => {
        this.props.previous(<EditSelectStep previous={this.props.previous} next={this.props.next}/>)
    }

    render() {
        return <div className="teacher-add-student-step">


            <div className="teacher-chapter-list-delete">

                {this.state.chaptersList.map((theChapter, index) => {
                    return <ChaptersRow
                        current={theChapter.chapterID === this.state.currentChapterID && this.state.edit}
                        id={"chapter" + theChapter.name + index}
                        value={theChapter} onClick={this.handleSelectChoice} key={index} theChapter={theChapter}
                    />
                })}

                <br/>
                <br/>
                <br/>
                <br/>
                <br/>

            </div>

            <button className="teacher-chapter-valid-delete-btn"
                    onClick={this.handleValidate}>{this.state.edit ? "Valider" : "Editer"}</button>

            <button onClick={this.handlePrevious} className="teacher-previous-btn">Précédent</button>
        </div>
    }

}


class ChaptersRow extends Component {


    constructor(props: P, context: any) {
        super(props, context);
        this.state = {
            domElem: null,
        }

    }

    componentDidMount() {
        if (!this.props.current) {
            this.setState({domElem: <h1 className="teacher-chapter-row-title">{this.props.theChapter.name}</h1>})
        } else {
            this.setState({domElem: <input id="edit-name" defaultValue={this.props.theChapter.name}></input>})
        }

    }

    componentWillReceiveProps(nextProps: Readonly<P>, nextContext: any) {
        if (!nextProps.current) {
            this.setState({domElem: <h1 className="teacher-chapter-row-title">{this.props.theChapter.name}</h1>})
        } else {
            this.setState({domElem: <input id="edit-name" defaultValue={this.props.theChapter.name}></input>})
        }
    }

    handleOpen = (event) => {
        this.props.onClick(event, this.props.theChapter.chapterID, this.props.id)
    }


    render() {
        return <div id={this.props.id} onClick={this.handleOpen} className="teacher-chapter-row">
            {this.state.domElem}
        </div>
    }

}


///////////////////////| EDIT QUESTION |/////////////////////////

export class EditQuestionSelectStep extends Component {

    constructor() {
        super();

        this.state = {
            currentQuestion: null,
            questionList: [],
            currentChapter: 0,
            chapterList: [],
            currentQuiz: 0,
            quizList: [],
            currentChoiceDOM: null
        }
    }

    componentDidMount() {

        getAllChapter().then(res => {
            this.setState({
                chapterList: res.data.chapters,
            })

            getQuizList(res.data.chapters[0].chapterID).then(result => {
                this.setState({
                    quizList: result.data.quizzes
                })

                if (result.data.quizzes.length > 0) {
                    getQuestionList(result.data.quizzes[0].quizID).then(resul => {

                        this.setState({
                            questionList: resul.data.questions
                        })
                    })
                } else {
                    this.setState({
                        questionList: []
                    })
                }
            })
        })

    }

    handleDisplayOverView = (theQuestion, id) => {
        let domObject = document.getElementById(id);
        if (!this.state.currentChoiceDOM) {

            domObject.style.backgroundColor = "var(--secondary_color)"

            this.setState({
                currentChoiceDOM: domObject,
                currentQuestion: theQuestion
            })
        } else {
            this.state.currentChoiceDOM.style.backgroundColor = "var(--primary_color)"
            domObject.style.backgroundColor = "var(--secondary_color)"

            this.setState({
                currentChoiceDOM: domObject,
                currentQuestion: theQuestion
            })
        }
    }

    handleValidate = (event) => {
        if (this.state.currentQuestion) {
            this.props.next(<EditQuestionDetailsStep openPopup={this.props.openPopup} closePopup={this.props.closePopup}
                                                     next={this.props.next} previous={this.props.previous}
                                                     question={this.state.currentQuestion}/>)
        }
    }

    handleGetQuestion = () => {

        getQuestionList(this.state.currentQuiz).then((response) => {
            this.setState({
                questionList: response.data.questions
            })

        })

    }


    handleUpdateChapterList = (event) => {

        getAllChapter().then(res => {
            this.setState({
                chapterList: res.data.chapters,
                currentChapter: event.target.value,
            })

            getQuizList(event.target.value).then(result => {
                this.setState({
                    quizList: result.data.quizzes
                })
                if (result.data.quizzes.length > 0) {
                    getQuestionList(result.data.quizzes[0].quizID).then(res => {
                        this.setState({
                            questionList: res.data.questions,
                            currentQuiz: result.data.quizzes[0].quizID
                        })
                    })
                } else {
                    this.setState({
                        questionList: []
                    })
                }
            })
        })
    }

    handleUpdateQuestionList = (event) => {

        this.setState({
            currentQuiz: event.target.value
        })
        getQuestionList(event.target.value).then(res => {
            this.setState({
                questionList: res.data.questions,
            })
        })
    }

    handlePrevious = () => {
        this.props.previous(<EditSelectStep previous={this.props.previous} next={this.props.next}/>)
    }


    render() {
        return <div className="teacher-default-dashboard-container">

            <div className="teacher-chapter-list-delete">

                <select onChange={this.handleUpdateChapterList} className="teacher-student-creation-input"
                        id="selected-class">
                    {this.state.chapterList.map((theChapter, index) => {
                        return <option key={index} value={theChapter.chapterID}>{theChapter.name}</option>
                    })}
                </select>
                <select onChange={this.handleUpdateQuestionList} className="teacher-student-creation-input"
                        id="selected-class">
                    {

                            this.state.quizList.map((theQuiz, index) => {
                                return <option key={index} value={theQuiz.quizID}>{theQuiz.quizName}</option>
                            })

                    }
                </select>

                {(this.state.questionList.length > 0) ? this.state.questionList.map((theQuestion, index) => {
                    return <QuestionRow onClick={this.handleDisplayOverView} value={theQuestion} key={index}
                                        id={"question" + theQuestion.name + index}/>
                }) : <h1 className="teacher-student-list-none">Aucune Question</h1>}

                <br/>
                <br/>
                <br/>
                <br/>
                <br/>

            </div>

            <button className="teacher-class-valid-delete-btn" onClick={this.handleValidate}>Editer</button>


            <button onClick={this.handlePrevious} className="teacher-previous-btn">Précédent</button>
        </div>
    }

}

class QuestionRow extends Component {


    handleClick = () => {
        this.props.onClick(this.props.value, this.props.id)
    }

    render() {
        return <div onClick={this.handleClick} className="teacher-class-row" id={this.props.id}>
            <h1 className="teacher-class-row-title">Question : {this.props.value.qNumber}</h1>
        </div>
    }

}


class EditQuestionDetailsStep extends Component {

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

        this.setState({
            currentChapter: this.props.question.theChapter,
            currentQuiz: this.props.question.theQuiz,
            selectedFile: this.props.question.image
        })

        getAllChapter().then(res => {
            this.setState({
                chaptersList: res.data.chapters,
            })

            getQuizList(this.state.currentChapter).then(result => {
                this.setState({
                    quizList: result.data.quizzes
                })
                getAnswersList(this.props.question.theQuiz, this.props.question.questionID).then(result => {
                    this.setState({
                        answerList: result.data.answers
                    })
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
        if (isValid && isValid.style.backgroundColor === "var(--secondary_color)") {
            isValid.style.backgroundColor = "var(--primary_color)"
            this.setState({
                isValid: true
            })
        } else {
            isValid.style.backgroundColor = "var(--secondary_color)"
            this.setState({
                isValid: false
            })
        }
    }

    handleAddAnswer = () => {
        let answerText = document.getElementById("select-textAnswer").value
        let tab = this.state.answerList

        tab.push({text: answerText, isValid: this.state.isValid})
        this.setState({
            answerList: tab
        })

    }

    handleDeleteAnswer = (event, theAnswer) => {

        this.setState({
            answerList: this.state.answerList.filter(function (aAnswer, index, arr) {
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
        let qNumber = document.getElementById("select-qNumber").value

        let type = 'OPEN'

        if (this.state.answerList.length > 1) {
            let nbValidAnswer = 0
            type = 'QCU'
            this.state.answerList.forEach(answer => {
                if (answer.isValid) {
                    nbValidAnswer++
                }
            })
            if (nbValidAnswer > 1) {
                type = 'QCM'
            }
        }

        if (valid) {
            deleteAnswersOfQuestion(this.props.question.questionID).then(response=>{
                if(response.data.returnState!==0)console.log("Error")
                updateQuestion(this.props.question.questionID,upperText,lowerText,type,level).then(response=>{
                    if(response.data.returnState!==0)console.log("Error")
                    if(this.state.selectedFile){
                        setImage(this.props.question.questionID,this.state.selectedFile).then(response=>{
                            }
                        )
                    }
                    this.state.answerList.forEach(answer => {
                        createAnswer(this.state.currentQuiz, this.props.question.questionID, answer.text, answer.isValid).then(r => {
                        })
                    })
                })
            })


        }

        //no reload
        this.props.previous(<EditSelectStep previous={this.props.previous} next={this.props.next}/>)
        event.preventDefault();
    }

    handleFileSelected = (event) => {
        this.setState({
            selectedFile: event.target.files[0]
        })
    }

    handlePrevious = () => {
        this.props.previous(<EditQuestionSelectStep previous={this.props.previous} next={this.props.next}/>)
    }

    handleDeleteFile =()=>{
        deleteImage(this.props.question.questionID).then(res => {
        });
    }

    render() {
        return <div className="teacher-add-student-step">

            <form className="teacher-student-creation-container" onSubmit={this.handleValidate}>
                <select onChange={this.handleUpdateList} className="teacher-student-creation-input"
                        id="selected-theChapter">
                    <option className="teacher-student-creation-option" value="empty">Choix du Chapitre</option>
                    {this.state.chaptersList.map((theChapter, index) => {
                        return <option key={index} value={theChapter.chapterID}
                                       selected={theChapter.chapterID == this.props.question.theChapter}>{theChapter.name}</option>
                    })}
                </select>
                <select onChange={this.handleUpdateQuizList} className="teacher-student-creation-input"
                        id="selected-theQuiz">
                    <option className="teacher-student-creation-option" value="empty">Choix du Quiz</option>
                    <option className="teacher-student-creation-option" value="noQuiz">Aucun Quiz</option>
                    {this.state.quizList.map((theQuiz, index) => {
                        return <option key={index} value={theQuiz.quizID}
                                       selected={theQuiz.quizID == this.props.question.theQuiz}>{theQuiz.quizName} </option>
                    })}
                </select>

                <h1 className="teacher-question-creation-text">Création Question</h1>

                <input className="teacher-student-creation-input" id="select-qNumber" placeholder="Numéro de question"
                       type="text" defaultValue={this.props.question.qNumber}/>
                <input className="teacher-student-creation-input" id="select-upperText" placeholder="Texte du haut"
                       type="text" defaultValue={this.props.question.upperText}/>
                       <div className="teacher-question-creation-answer">
                           <input onChange={this.handleFileSelected} className="teacher-student-creation-inputcreation-input" id="select-image"
                                  placeholder="Image" type="file" name="file"/>
                           <input onClick={this.handleDeleteFile} id="delete-image" className="teacher-question-creation-answer-valid"/>
                       </div>

                <input className="teacher-student-creation-input" id="select-lowerText" placeholder="Texte du bas"
                       type="text" defaultValue={this.props.question.lowerText}/>
                <input className="teacher-student-creation-input" id="select-level" placeholder="Difficulté" type="text"
                       defaultValue={this.props.question.level}/>

                <h1 className="teacher-question-creation-text">Création Réponse</h1>

                <div className="teacher-question-creation-answer">
                    <input className="teacher-student-creation-input-answer" id="select-textAnswer"
                           placeholder="Réponse" type="text"/>
                    <div className="teacher-question-creation-answer-valid" id="toggle-switch"
                         onClick={this.handleSwitch}>
                        <h2 className="teacher-question-creation-answer-is-valid-text"
                            id="select-isValidAnswer">Vrai</h2>
                    </div>
                    <input onClick={this.handleAddAnswer} className="teacher-question-creation-answer-addButton"
                           type="button" value="+"/>

                </div>

                <div className="teacher-question-creation-answer-list">
                    {this.state.answerList.map((theAnswer, index) => {
                        return <AnswersRow id={theAnswer.answerID} value={theAnswer} onClick={this.handleDeleteAnswer}
                                           key={index} theAnswer={theAnswer}/>
                    })}
                </div>

                <br/>
                <br/>

                <input className="teacher-student-creation-valid" type="submit" value="Valider"/>
            </form>


            <button onClick={this.handlePrevious} className="teacher-previous-btn">Précédent</button>
        </div>
    }

}

class AnswersRow extends Component {

    handleClick = (event) => {
        this.props.onClick(event, this.props.theAnswer)
    }

    componentDidMount() {
    }

    render() {
        return <div onClick={this.handleClick} id={this.props.id} className="teacher-chapter-row">
            <h1 className="teacher-chapter-row-title">{this.props.theAnswer.text}</h1>
        </div>
    }

}

///////////////////////| DELETE QUIZ |/////////////////////////

export class EditQuizListStep extends Component {

    constructor() {
        super();

        this.state = {
            currentQuiz: null,
            quizList: [],
            currentChapter: 0,
            chapterList: [],
            currentChoiceDOM: null
        }
    }

    componentDidMount() {


        getAllChapter().then(res => {
            this.setState({
                chapterList: res.data.chapters
            })

            getQuizList(res.data.chapters[0].chapterID).then(res => {
                if (this.props.formCreate) {
                    this.setState({
                        quizList: res.data.quizzes,
                        currentChapter: this.props.formCreate.theChapter.chapterID,
                        currentQuiz: this.props.formCreate.theQuiz
                    })
                } else {
                    this.setState({
                        quizList: res.data.quizzes
                    })
                }


            })
        })

    }

    handleValidate = (event) => {
        if(this.state.currentQuiz){
            this.props.next(<EditQuizDetailsStep previous={this.props.previous} next={this.props.next} quiz={this.state.currentQuiz}/>)
        }
    }

    handleDisplayOverView = (theQuiz,id) => {
        let domObject = document.getElementById(id);
        if(!this.state.currentChoiceDOM){

            domObject.style.backgroundColor = "var(--secondary_color)"

            this.setState({
                currentChoiceDOM :domObject,
                currentQuiz: theQuiz
            })
        }else{
            this.state.currentChoiceDOM.style.backgroundColor = "var(--primary_color)"
            domObject.style.backgroundColor = "var(--secondary_color)"

            this.setState({
                currentChoiceDOM :domObject,
                currentQuiz: theQuiz
            })
        }
    }

    handleUpdateList = (event) => {

        getQuizList(event.target.value).then(res => {

            this.setState({
                quizList: res.data.quizzes,
                currentChapter: event.target.value
            })

        })

    }

    handleSelect = (event, quiz) =>{
        this.setState({
            currentQuiz: quiz
        })
    }

    handlePrevious = () => {
        this.props.previous(<EditSelectStep previous={this.props.previous} next={this.props.next} />)
    }

    render() {
        return <div className="teacher-default-dashboard-container">

            <div className="teacher-students-list-overview">

                <select onChange={this.handleUpdateList} className="teacher-student-creation-input" id="selected-class">
                    {this.state.chapterList.map((theChapter, index) => {
                        return <option key={index} value={theChapter.chapterID}>{theChapter.name}</option>
                    })}
                </select>

                {(this.state.quizList.length > 0)?this.state.quizList.map( (theQuiz, index) => {
                    return <QuizRow onClick={this.handleDisplayOverView} value={theQuiz} key={index} id={"question"+index}/>
                }):<h1 className="teacher-student-list-none">Aucun Quiz</h1>}

                <br/>
                <br/>
                <br/>
                <br/>
                <br/>

            </div>
            <button className="teacher-student-valid-delete-btn" onClick={this.handleValidate} >Editer</button>

            <button onClick={this.handlePrevious} className="teacher-previous-btn" >Précédent</button>
        </div>
    }

}

class QuizRow extends Component {


    handleClick = (event) => {
        this.props.onClick(this.props.value,this.props.id)
    }


    render() {
        return <div onClick={this.handleClick} className="teacher-student-row" id={this.props.id}>
            <h1 className="teacher-student-row-title" >{this.props.value.quizName} </h1>
        </div>
    }

}


class EditQuizDetailsStep extends Component{

    constructor() {
        super();

        this.state = {
            currentChapter: 0,
            chaptersList: [],
            isOrder: false
        }
    }

    componentDidMount() {
        this.setState({currentChapter:this.props.quiz.theChapter})
        if(this.props.quiz.asAnOrder==="true") this.handleSwitch();
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
            setQuizName(this.props.quiz.quizID,name).then(response=>{
                if(response.data.returnState!==0)console.error("ERROR")
                setQuizOrdered(this.props.quiz.quizID,isOrder).then(response=>{
                    if(response.data.returnState!==0)console.error("ERROR")
                    }
                )
            })
        }

        this.props.previous(<EditSelectStep previous={this.props.previous} next={this.props.next}/>)

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
        this.props.previous(<EditQuizListStep previous={this.props.previous} next={this.props.next} />)
    }

    render() {
        return <div className="teacher-add-student-step">

            <form className="teacher-student-creation-container" onSubmit={this.handleValidate}>

                <input className="teacher-student-creation-input" id="select-name" placeholder="Nom" type="text" defaultValue={this.props.quiz.quizName}/>

                <select onChange={this.handleUpdateList} className="teacher-student-creation-input" id="selected-class">
                    <option className="teacher-student-creation-option" value="empty">Choix du Chapitre</option>
                    {this.state.chaptersList.map((theChapter, index) => {
                        return <option key={index} value={theChapter.chapterID} selected={theChapter.chapterID==this.state.currentChapter}>{theChapter.name}</option>
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

