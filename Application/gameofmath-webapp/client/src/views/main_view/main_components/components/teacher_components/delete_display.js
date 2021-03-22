import {Component} from "react";
import {PopupMessage} from "../../teacher_display_2.0";
import {createClass, deleteClass, getAllClasses} from "../../../../../model/classModel";

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

                this.props.next(<DeleteStudentStep openPopup={this.props.openPopup} closePopup={this.props.closePopup}
                                                 next={this.props.next} previous={this.props.previous}/>)


                break
            case this.CLASS_TEXT:

                this.props.next(<DeleteClassStep openPopup={this.props.openPopup} closePopup={this.props.closePopup}  next={this.props.next} previous={this.props.previous} />)
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

            <h1 className="teacher-add-choice-title">Supprimer</h1>

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



///////////////////////| DELETE STUDENT |/////////////////////////


///////////////////////| DELETE CLASS |///////////////////////////




class DeleteClassStep extends Component{


    constructor() {
        super();

        this.state = {
            currentChoiceDOM:null,
            currentCLassID:-1,
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


    handleSelectChoice = (event, id) => {


        if(!this.state.currentChoiceDOM){
            event.nativeEvent.explicitOriginalTarget.style.backgroundColor = "var(--secondary_color)"

            this.setState({
                currentChoiceDOM :event.nativeEvent.explicitOriginalTarget,
                currentCLassID: id
            })
        }else{
            this.state.currentChoiceDOM.style.backgroundColor = "var(--primary_color)"
            event.nativeEvent.explicitOriginalTarget.style.backgroundColor = "var(--secondary_color)"

            this.setState({
                currentChoiceDOM :event.nativeEvent.explicitOriginalTarget,
                currentCLassID: id
            })
        }



    }



    handleValidate = (event) => {

        deleteClass(this.state.currentCLassID).then(res => {
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
                    return <ClassesRow value={theClass} onClick={this.handleSelectChoice} key={index} theClass={theClass}/>
                })}

                <br/>
                <br/>
                <br/>
                <br/>
                <br/>

            </div>

            <button className="teacher-class-valid-delete-btn" onClick={this.handleValidate} >Valider</button>



            <button onClick={this.handlePrevious} className="teacher-previous-btn" >Précedent</button>
        </div>
    }

}


class ClassesRow extends Component{



    handleOpen = (event) => {
        this.props.onClick(event,this.props.theClass.classID)
    }


    render() {
        return <div onClick={this.handleOpen} className="teacher-class-row">
            <h1 className="teacher-class-row-title">{this.props.theClass.name}</h1>
        </div>
    }

}
