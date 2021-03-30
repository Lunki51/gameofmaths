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
                getQuizList(res.data.chapters[0].chapterID).then(result => {
                    this.setState({
                        quizList: result.data.quizzes
                    })

                    if(result.data.quizzes.length > 0) {
                        getQuestionList(result.data.quizzes[0].quizID).then(r => {

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
                        return <option key={index} value={theChapter.chapterID}>{theChapter.name}</option>
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
            <h1 className="teacher-class-overview-title">Id: {this.props.theQuestion.type}</h1>
        </>
    }
}