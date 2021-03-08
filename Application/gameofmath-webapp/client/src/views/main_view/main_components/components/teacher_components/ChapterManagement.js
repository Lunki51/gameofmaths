import {Component} from "react";

class ChapterManagement extends Component{

    _isMount = false;

    constructor() {
        super();

        this.state = {

            chapterList : []

        }
    }
    componentDidMount() {
        this._isMount = true

        this.insertTest()
    }

    componentWillUnmount() {
        this._isMount = false
    }


    insertTest = () => {

        this.state.chapterList.push({title : "mathiere", quiz : [{},{},{},{},{}]})
        this.state.chapterList.push({title : "mathiere1", quiz : [{},{},{},{},{}]})
        this.state.chapterList.push({title : "mathiere2", quiz : [{},{},{},{},{}]})
        this.state.chapterList.push({title : "mathiere3", quiz : [{},{},{},{},{}]})
        this.state.chapterList.push({title : "mathiere4", quiz : [{},{},{},{},{}]})

    }



    render() {

        return <div className="chapter-management-container">

            {this.state.chapterList.forEach((chapter) => {

                return <ChapterObject title={chapter.title} quizzs={chapter.quiz}/>

            })}

        </div>


    }

}



class ChapterObject extends Component{

    constructor() {
        super();

        this.state = {
            title: "",
            quiz: []
        }
    }

    render() {


        return <button onClick={this.props.onClick} className="chapter-object-container">

            <h2 className="chapter-object-title">{this.state.title}</h2>

        </button>


    }


}