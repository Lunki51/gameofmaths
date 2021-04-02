import React, {Component} from "react";
import {deleteClass, getAllClasses} from "../../../../../model/classModel";
import {getAllStudents,deleteTheStudents} from "../../../../../model/studentModel";
import {getAllChapter, deleteChapter} from "../../../../../model/chapterModel";
import {getQuizList, deleteQuiz, addQuestion, getQuestionList, deleteQuestion} from "../../../../../model/quizModel";

export class DeleteDisplay extends Component{

    constructor(props) {
        super(props);

        this.state = {
            currentStepScreen: <DeleteSelectStep openWaring={props.waringOpen} openError={props.errorOpen} previous={this.handlePrevious} next={this.handleNext}/>
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


class DeleteSelectStep extends Component{

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
            currentChoiceDOM:null,

        }
    }





    handleConfirmChoice = () => {

        switch (this.state.currentChoice) {
            case this.STUDENT_TEXT:

                this.props.next(<DeleteStudentStep openPopup={this.props.openPopup} closePopup={this.props.closePopup} next={this.props.next} previous={this.props.previous}/>)
                break
            case this.CLASS_TEXT:

                this.props.next(<DeleteClassStep openPopup={this.props.openPopup} closePopup={this.props.closePopup}  next={this.props.next} previous={this.props.previous} />)
                break
            case this.CHAPTER_TEXT:

                this.props.next(<DeleteChapterStep openPopup={this.props.openPopup} closePopup={this.props.closePopup}  next={this.props.next} previous={this.props.previous} />)
                break
            case this.QUESTION_TEXT:

                this.props.next(<DeleteQuestionStep openPopup={this.props.openPopup} closePopup={this.props.closePopup}  next={this.props.next} previous={this.props.previous} />)
                break
            case this.QUIZ_TEXT:

                this.props.next(<DeleteQuizStep openPopup={this.props.openPopup} closePopup={this.props.closePopup}  next={this.props.next} previous={this.props.previous} />)
                break
            default:

                this.props.openError("Aucun choix n'a été sectionné")

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

            <h1 className="teacher-add-choice-title">Supprimer</h1>

            <div className="teacher-selection-option-list">
                <SelectionChoice id="student" onClick={this.handleSelectChoice} title={this.STUDENT_TEXT}  />
                <SelectionChoice id="class" onClick={this.handleSelectChoice} title={this.CLASS_TEXT} />
                <SelectionChoice id="chapter" onClick={this.handleSelectChoice} title={this.CHAPTER_TEXT} />
                <SelectionChoice id="question" onClick={this.handleSelectChoice} title={this.QUESTION_TEXT} />
                <SelectionChoice id="quiz" onClick={this.handleSelectChoice} title={this.QUIZ_TEXT} />

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

///////////////////////| DELETE STUDENT |/////////////////////////

export class DeleteStudentStep extends Component {

    constructor() {
        super();

        this.state = {
            currentStudent: null,
            studentList: [],
            currentClass: 0,
            classesList: [],
            selectedList: []
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
                        currentClass: this.props.formCreate.theClass.classID,
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

    handleValidate = (event) => {

        let deleteList = ""



        this.state.selectedList.forEach((theStudent) => {

            deleteTheStudents(theStudent.userID,parseInt(this.state.currentClass)).then(res => {

                if(res.data.returnState <1 ){
                    getAllStudents(this.state.currentClass).then(results => {

                        this.setState({
                            studentList: results.data.students,
                            selectedList:[]
                        })


                    })
                }else {

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

        getAllStudents(event.target.value).then(res => {

            this.setState({
                studentList: res.data.students,
                currentClass: event.target.value
            })

        })

    }

    handleUpdateListByID = (id) => {

        getAllStudents(id).then(res => {

            this.setState({
                studentList: res.data.students,
                currentClass: id
            })

        })

    }


    handleSelect = (event,id, student) =>{

        let container = document.getElementById(id);

        console.log(event.target)

        if((container.style.backgroundColor === "var(--primary_color)" || !container.style.backgroundColor) && id === event.target.id){
            container.style.backgroundColor = "var(--secondary_color)"
            this.state.selectedList.push(student)
        }else{
            container.style.backgroundColor = "var(--primary_color)"
            this.setState({
                selectedList: this.state.selectedList.filter(function(aStudent, index, arr){
                    return aStudent !== student;
                })
                }
            )
        }

    }

    handlePrevious = () => {
        this.props.previous(<DeleteSelectStep previous={this.props.previous} next={this.props.next} />)
    }

    render() {
        return <div className="teacher-default-dashboard-container">

            <div className="teacher-students-list-overview">

                <select onChange={this.handleUpdateList} className="teacher-student-creation-input" id="selected-class">
                    {this.state.classesList.map((theClass, index) => {
                        return <option key={index} value={theClass.classID}>{theClass.name}</option>
                    })}
                </select>

                {(this.state.studentList.length > 0)?this.state.studentList.map( (theStudent, index) => {
                    return <StudentRow id={"student:"+theStudent.userID+":"+index} onClick={this.handleSelect} value={theStudent} key={index}/>
                }):<h1 className="teacher-student-list-none">Aucun Elève</h1>}

                <br/>
                <br/>
                <br/>
                <br/>
                <br/>

            </div>
            <button className="teacher-student-valid-delete-btn" onClick={this.handleValidate} >Supprimer</button>

            <button onClick={this.handlePrevious} className="teacher-previous-btn" >Précédent</button>
        </div>
    }

}

class StudentRow extends Component {


    handleClick = (event) => {
        this.props.onClick(event,this.props.id,this.props.value)
    }


    render() {
        return <div id={this.props.id} onClick={this.handleClick} className="teacher-student-row">
            <h1 className="teacher-student-row-title">{this.props.value.lastname}</h1>
        </div>
    }

}

///////////////////////| DELETE CLASS |///////////////////////////

class DeleteClassStep extends Component{


    constructor() {
        super();

        this.state = {
            currentChoiceDOM:null,
            currentClassID:-1,
            classesList: []
        }
    }

    handleGetClasses = () => {

        getAllClasses().then((response) => {

            this.setState({
                classesList:response.data.classes
            })

        })



    }

    componentDidMount() {
        this.handleGetClasses()
    }


    handleSelectChoice = (event, classId,id) => {
        let domObject = document.getElementById(id);
        if(!this.state.currentChoiceDOM){

            domObject.style.backgroundColor = "var(--secondary_color)"

            this.setState({
                currentChoiceDOM :domObject,
                currentClassID: classId
            })
        }else{
            this.state.currentChoiceDOM.style.backgroundColor = "var(--primary_color)"
            domObject.style.backgroundColor = "var(--secondary_color)"

            this.setState({
                currentChoiceDOM :domObject,
                currentClassID: classId
            })
        }

    }

    handleValidate = (event) => {

        deleteClass(this.state.currentClassID).then(res => {
            console.log(res)
            this.handleGetClasses()
        })

    }

    handlePrevious = () => {
        this.props.previous(<DeleteSelectStep previous={this.props.previous} next={this.props.next} />)
    }

    render() {
        return <div className="teacher-add-student-step">


            <div className="teacher-class-list-delete">

                {this.state.classesList.map( (theClass, index) => {
                    return <ClassesRow id={"class"+theClass.name+index} value={theClass} onClick={this.handleSelectChoice} key={index} theClass={theClass}/>
                })}

                <br/>
                <br/>
                <br/>
                <br/>
                <br/>

            </div>

            <button className="teacher-class-valid-delete-btn" onClick={this.handleValidate} >Supprimer</button>



            <button onClick={this.handlePrevious} className="teacher-previous-btn" >Précédent</button>
        </div>
    }

}

class ClassesRow extends Component{

    handleOpen = (event) => {
        this.props.onClick(event,this.props.theClass.classID,this.props.id)
    }


    render() {
        return <div id={this.props.id} onClick={this.handleOpen} className="teacher-class-row">
            <h1 className="teacher-class-row-title">{this.props.theClass.name}</h1>
        </div>
    }

}

///////////////////////| DELETE CHAPTER |/////////////////////////

class DeleteChapterStep extends Component{


    constructor() {
        super();

        this.state = {
            currentChoiceDOM:null,
            currentChapterID:-1,
            chaptersList: []
        }
    }

    handleGetChapters = () => {

        getAllChapter().then((response) => {

            console.log(response)
            this.setState({
                chaptersList:response.data.chapters
            })

        })

    }

    componentDidMount() {
        this.handleGetChapters()
    }


    handleSelectChoice = (event, chapterId,id) => {
        let domObject = document.getElementById(id);
        if(!this.state.currentChoiceDOM){

            domObject.style.backgroundColor = "var(--secondary_color)"

            this.setState({
                currentChoiceDOM :domObject,
                currentChapterID: chapterId
            })
        }else{
            this.state.currentChoiceDOM.style.backgroundColor = "var(--primary_color)"
            domObject.style.backgroundColor = "var(--secondary_color)"

            this.setState({
                currentChoiceDOM :domObject,
                currentChapterID: chapterId
            })
        }

    }

    handleValidate = (event) => {

        deleteChapter(this.state.currentChapterID).then(res => {
            console.log(res)
            this.handleGetChapters()
        })

    }

    handlePrevious = () => {
        this.props.previous(<DeleteSelectStep previous={this.props.previous} next={this.props.next} />)
    }

    render() {
        return <div className="teacher-add-student-step">


            <div className="teacher-chapter-list-delete">

                {this.state.chaptersList.map( (theChapter, index) => {
                    return <ChaptersRow id={"chapter"+theChapter.name+index} value={theChapter} onClick={this.handleSelectChoice} key={index} theChapter={theChapter}/>
                })}

                <br/>
                <br/>
                <br/>
                <br/>
                <br/>

            </div>

            <button className="teacher-chapter-valid-delete-btn" onClick={this.handleValidate} >Supprimer</button>



            <button onClick={this.handlePrevious} className="teacher-previous-btn" >Précédent</button>
        </div>
    }

}


class ChaptersRow extends Component{



    handleOpen = (event) => {
        this.props.onClick(event,this.props.theChapter.chapterID,this.props.id)
    }


    render() {
        return <div id={this.props.id} onClick={this.handleOpen} className="teacher-chapter-row">
            <h1 className="teacher-chapter-row-title">{this.props.theChapter.name}</h1>
        </div>
    }

}

///////////////////////| DELETE QUESTION |/////////////////////////
export class DeleteQuestionStep extends Component {

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

                if(result.data.quizzes.length > 0) {
                    getQuestionList(result.data.quizzes[0].quizID).then(resul => {

                        this.setState({
                            questionList: resul.data.questions
                        })
                    })
                }else{
                    this.setState({
                        questionList: []
                    })
                }
            })
        })

    }

    handleDisplayOverView = (theQuestion,id) => {
        let domObject = document.getElementById(id);
        console.log(domObject)
        if(!this.state.currentChoiceDOM){

            domObject.style.backgroundColor = "var(--secondary_color)"

            this.setState({
                currentChoiceDOM :domObject,
                currentQuestion: theQuestion
            })
        }else{
            this.state.currentChoiceDOM.style.backgroundColor = "var(--primary_color)"
            domObject.style.backgroundColor = "var(--secondary_color)"

            this.setState({
                currentChoiceDOM :domObject,
                currentQuestion: theQuestion
            })
        }

    }

    handleValidate = (event) => {
        console.log(this.state.currentQuestion.questionID,this.state.currentQuiz)
        deleteQuestion(this.state.currentQuestion.questionID,this.state.currentQuiz).then(res => {
            console.log(res)
            this.handleGetQuestion()
        })

    }

    handleGetQuestion = () => {

        getQuestionList(this.state.currentQuiz).then((response) => {
            console.log(response)
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
                if(result.data.quizzes.length > 0) {
                    getQuestionList(result.data.quizzes[0].quizID).then(res => {
                        this.setState({
                            questionList: res.data.questions,
                            currentQuiz: result.data.quizzes[0].quizID
                        })
                    })
                }else{
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
            console.log(res.data.questions)
            this.setState({
                questionList: res.data.questions,
            })
        })
    }
    
    handlePrevious = () => {
        this.props.previous(<DeleteSelectStep previous={this.props.previous} next={this.props.next} />)
    }


    render() {
        return <div className="teacher-default-dashboard-container">

            <div className="teacher-chapter-list-delete">

                <select onChange={this.handleUpdateChapterList} className="teacher-student-creation-input" id="selected-class">
                    {this.state.chapterList.map((theChapter, index) => {
                        return <option key={index} value={theChapter.chapterID}>{theChapter.name}</option>
                    })}
                </select>
                <select onChange={this.handleUpdateQuestionList} className="teacher-student-creation-input" id="selected-class">
                    {this.state.quizList.map((theQuiz, index) => {
                        return <option key={index} value={theQuiz.quizID}>{theQuiz.quizName}</option>
                    })}
                </select>

                {(this.state.questionList.length > 0)?this.state.questionList.map( (theQuestion, index) => {
                    return <QuestionRow onClick={this.handleDisplayOverView} value={theQuestion} key={index} id={"question"+theQuestion.name+index}/>
                }):<h1 className="teacher-student-list-none">Aucune Question</h1>}

                <br/>
                <br/>
                <br/>
                <br/>
                <br/>

            </div>

            <button className="teacher-class-valid-delete-btn" onClick={this.handleValidate} >Supprimer</button>



            <button onClick={this.handlePrevious} className="teacher-previous-btn" >Précédent</button>
        </div>
    }

}

class QuestionRow extends Component {


    handleClick = () => {
        this.props.onClick(this.props.value,this.props.id)
    }

    render() {
        return <div onClick={this.handleClick} className="teacher-class-row" id={this.props.id}>
            <h1 className="teacher-class-row-title">Question : {this.props.value.qNumber}</h1>
        </div>
    }

}

///////////////////////| DELETE STUDENT |/////////////////////////

export class DeleteQuizStep extends Component {

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

        deleteQuiz(this.state.currentQuiz.quizID).then(res => {

            getQuizList(this.state.currentQuiz).then(res => {
                this.setState({
                    quizList: res.data.quizzes
                })

            })

        })

    }

    handleDisplayOverView = (theQuiz,id) => {
        let domObject = document.getElementById(id);
        console.log(domObject)
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
        this.props.previous(<DeleteSelectStep previous={this.props.previous} next={this.props.next} />)
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
                    console.log(theQuiz)
                    return <QuizRow onClick={this.handleDisplayOverView} value={theQuiz} key={index} id={"question"+index}/>
                }):<h1 className="teacher-student-list-none">Aucun Quiz</h1>}

                <br/>
                <br/>
                <br/>
                <br/>
                <br/>

            </div>
            <button className="teacher-student-valid-delete-btn" onClick={this.handleValidate} >Supprimer</button>

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