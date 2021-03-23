import {Component} from "react";
import {PopupMessage} from "../../teacher_display_2.0";
import {deleteClass, getAllClasses} from "../../../../../model/classModel";
import {getAllStudents,deleteTheStudents} from "../../../../../model/studentModel";
import {getAllChapter, deleteChapter} from "../../../../../model/chapterModel";

export class DeleteDisplay extends Component{

    constructor() {
        super();

        this.state = {
            currentStepScreen: <DeleteSelectStep openPopup={this.handleOpenPopup} previous={this.handlePrevious} next={this.handleNext}/>
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


class DeleteSelectStep extends Component{

    // static variables
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

                this.props.next(<DeleteStudentStep openPopup={this.props.openPopup} closePopup={this.props.closePopup} next={this.props.next} previous={this.props.previous}/>)
                break
            case this.CLASS_TEXT:

                this.props.next(<DeleteClassStep openPopup={this.props.openPopup} closePopup={this.props.closePopup}  next={this.props.next} previous={this.props.previous} />)
                break
            case this.CHAPTER_TEXT:

                this.props.next(<DeleteChapterStep openPopup={this.props.openPopup} closePopup={this.props.closePopup}  next={this.props.next} previous={this.props.previous} />)
                break
            case this.QUESTION_TEXT:


                break
            default:

                this.props.openPopup(<PopupMessage
                    message="Aucune selection"
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

            <h1 className="teacher-add-choice-title">Supprimer</h1>

            <div className="teacher-selection-option-list">
                <SelectionChoice id="student" onClick={this.handleSelectChoice} title={this.STUDENT_TEXT}  />
                <SelectionChoice id="class" onClick={this.handleSelectChoice} title={this.CLASS_TEXT} />
                <SelectionChoice id="chapter" onClick={this.handleSelectChoice} title={this.CHAPTER_TEXT} />
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

///////////////////////| DELETE STUDENT |/////////////////////////


export class DeleteStudentStep extends Component {

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

        deleteTheStudents(this.state.currentStudent.studentId,this.state.currentClass).then(res => {

            getAllStudents(this.state.currentClass).then(res => {

                this.setState({
                    studentList: res.data.students
                })

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

    handleSelect = (event, student) =>{
        this.setState({
            currentStudent: student
        })
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
                    return <StudentRow onClick={this.handleSelect} value={theStudent} key={index}/>
                }):<h1 className="teacher-student-list-none">Aucun Elève</h1>}



            </div>
            <button className="teacher-student-valid-delete-btn" onClick={this.handleValidate} >Supprimer</button>

            <button onClick={this.handlePrevious} className="teacher-previous-btn" >Précedent</button>
        </div>
    }

}

class StudentRow extends Component {


    handleClick = (event) => {
        this.props.onClick(event,this.props.value)
    }


    render() {
        return <div onClick={this.handleClick} className="teacher-student-row">
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



            <button onClick={this.handlePrevious} className="teacher-previous-btn" >Précedent</button>
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



            <button onClick={this.handlePrevious} className="teacher-previous-btn" >Précedent</button>
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
