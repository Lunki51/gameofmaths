import {Component} from "react";
import {getQuizList} from "../../../../../model/quizModel";
import {getAllChapter} from "../../../../../model/chapterModel";
import {getQuestionList} from "../../../../../model/quizModel";

export class QuestionDisplay extends Component {

    constructor() {
        super();

        this.state = {
            currentQuestion: null,
            questionList: [],
            currentChapter: 0,
            chapterList: [],
            currentQuiz: 0,
            quizList: []
        }
    }

    componentDidMount() {

        getAllChapter().then(res => {

            this.setState({
                chapterList: res.data.chapters,
            })


            if(res.data.chapters.length > 0) {

                let idChapter, idQuiz;

                if(this.props.fromSearch && this.props.fromSearch.type === "chapter"){
                    idChapter= this.props.fromSearch.object.chapterID;
                }else if(this.props.fromSearch && this.props.fromSearch.type === "quiz"){
                    idChapter = this.props.fromSearch.object.theChapter;
                    idQuiz =  this.props.fromSearch.object.quizID;
                }else{
                    if(this.props.fromSearch && this.props.fromSearch.type === "question"){
                        this.setState({
                            currentQuestion: this.props.fromSearch.object
                        })
                    }
                }


                getQuizList((!idChapter)?res.data.chapters[0].chapterID:idChapter).then(result => {
                    this.setState({
                        quizList: result.data.quizzes
                    })


                    if(result.data.quizzes.length > 0) {


                        getQuestionList((!idQuiz)?(result.data.quizzes[0].quizID):idQuiz).then(r => {

                            this.setState({
                                questionList: r.data.questions
                            })


                        })

                    }else{
                        this.setState({
                            questionList: []
                        })
                    }
                })

            }else{
                this.setState({
                    quizList: []
                })
            }
        })

    }

    handleDisplayOverView = (theQuestion) => {

        this.setState({
            currentQuestion: theQuestion
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

                    if(result.data.quizzes.length) {
                        getQuestionList(result.data.quizzes[0].quizID).then(res => {
                            this.setState({
                                questionList: res.data.questions
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

    componentWillReceiveProps(nextProps, nextContext) {


        getAllChapter().then(res => {

            this.setState({
                chapterList: res.data.chapters,
            })


            if(res.data.chapters.length > 0) {

                let idChapter, idQuiz;

                if(nextProps.fromSearch && nextProps.fromSearch.type === "chapter"){
                    idChapter= nextProps.fromSearch.object.chapterID;
                    document.getElementById("chapter:"+idChapter).selected = true
                }else if(nextProps.fromSearch && nextProps.fromSearch.type === "quiz"){
                    idChapter = nextProps.fromSearch.object.theChapter;
                    document.getElementById("chapter:"+idChapter).selected = true
                    idQuiz =  nextProps.fromSearch.object.quizID;
                }else{

                    if(nextProps.fromSearch && nextProps.fromSearch.type === "question"){

                        document.getElementById("chapter:"+nextProps.fromSearch.object.theChapter).selected = true

                        this.setState({
                            currentQuestion: nextProps.fromSearch.object
                        })

                    }
                }

                getQuizList((!idChapter)?res.data.chapters[0].chapterID:idChapter).then(result => {

                    if( !nextProps.fromSearch){
                        document.getElementById("chapter:"+res.data.chapters[0].chapterID).selected = true
                    }

                    this.setState({
                        quizList: result.data.quizzes
                    })


                    if(result.data.quizzes.length > 0) {


                        getQuestionList((!idQuiz)?(result.data.quizzes[0].quizID):idQuiz).then(r => {

                            this.setState({
                                questionList: r.data.questions
                            })


                        })

                    }else{
                        this.setState({
                            questionList: []
                        })
                    }
                })

            }else{
                this.setState({
                    quizList: []
                })
            }
        })


    }

    handleUpdateQuestionList = (event) => {

            getQuestionList(event.target.value).then(res => {
                this.setState({
                    questionList: res.data.questions
                })
            })
    }

    render() {
        return <div className="teacher-default-dashboard-container">

            <div className="teacher-class-list-overview">

                <select onChange={this.handleUpdateChapterList} className="teacher-student-creation-input" id="selected-class">
                    {this.state.chapterList.map((theChapter, index) => {
                        return <option key={index} id={"chapter:"+theChapter.chapterID} value={theChapter.chapterID}>{theChapter.name}</option>
                    })}
                </select>
                <select onChange={this.handleUpdateQuestionList} className="teacher-student-creation-input" id="selected-class">
                    {this.state.quizList.map((theQuiz, index) => {
                        return <option key={index} value={theQuiz.quizID}>{theQuiz.quizName}</option>
                    })}
                </select>

                {(this.state.questionList.length > 0)?this.state.questionList.map( (theQuestion, index) => {
                    return <QuestionRow onClick={this.handleDisplayOverView} value={theQuestion} key={index}/>
                }):<h1 className="teacher-student-list-none">Aucune Question</h1>}

            </div>

            <div className="teacher-class-overview">

                {(this.state.currentQuestion) ? <QuestionOverview theQuestion={this.state.currentQuestion}/> :
                    <h1 className="teacher-no-class">Aucune Question sélectionné</h1>}

            </div>

        </div>
    }

}

class QuestionRow extends Component {


    handleClick = () => {
        this.props.onClick(this.props.value)
    }

    render() {
        return <div onClick={this.handleClick} className="teacher-class-row">
            <h1 className="teacher-class-row-title">Question : {this.props.value.qNumber}</h1>
        </div>
    }

}

class QuestionOverview extends Component {

    render() {
        return <>
            <h1 className="teacher-class-overview-title">Question: N°{this.props.theQuestion.qNumber}</h1>

            <div className="teacher-question-information">
                <h1 className="teacher-question-overview-title">Upper text: {this.props.theQuestion.upperText}</h1>
                <h1 className="teacher-question-overview-title">Lower text: {this.props.theQuestion.lowerText}</h1>
                <h1 className="teacher-question-overview-title">Type: {this.props.theQuestion.type}</h1>

            </div>


        </>
    }
}