import React, {Component} from "react";
import {search} from "../../../../../model/searchModel";
import {EditDisplay} from "./edit_display";
import {ClassDisplay} from "./ClassDisplay";
import {StudentDisplay} from "./student_display";
import {ClassesDisplay} from "./classes_display";
import {QuestionDisplay} from "./question_display";

export class SearchDisplay extends Component{

    constructor() {
        super();

        this.state = {
            currentFilter:"",
            searchResult:[],
            searchResultElement: null
        }
    }

    handleChange = (event) => {

        if(event.target.value !== ""){

            search(event.target.value).then(res => {
                if(res.data.results.length > 0){
                    this.handleOpenResult(res.data.results)
                }else{
                    this.handleNoResult()
                }
            })

        }else{
            this.handleCloseResult()
        }

        this.setState({
            currentFilter: event.target.value
        })
    }

    handleOpenResult = (results) => {
        this.setState({
            searchResultElement: <div className="teacher-search-result"> {results.map((Row, key )=> {
                return <RowResult dismiss={this.props.dismiss} errorOpen={this.props.errorOpen} waringOpen={this.props.waringOpen} redirect={this.props.redirect} key={key} res={Row} />
            })} </div>
        })
    }

    handleCloseResult = () => {
        this.setState({
            searchResultElement: null
        })
    }

    handleNoResult = () => {
        this.setState({
            searchResultElement: <div className="teacher-search-no-result">
                <h1 className="teacher-search-no-result-text">Aucun résultat</h1>
            </div>
        })
    }

    render() {
        return <>
                <input placeholder="Rechercher..." className="teacher-search-input" value={this.state.currentFilter} onChange={this.handleChange}/>
                {this.state.searchResultElement}

                <div onClick={this.props.dismiss} className="dim-background"/>


            </>
    }

}


class RowResult extends Component{

    constructor() {
        super();
        this.state = {
            type: "",
            textDisplay: "",
        }
    }

    componentDidMount() {

        switch (this.props.res.type) {
            case "class":
                this.setState({
                    type : "Classe",
                    textDisplay: this.props.res.object.name
                })
                break;
            case "chapter":
                this.setState({
                    type : "Chapitre",
                    textDisplay: this.props.res.object.name
                })
                break;
            case "student":
                this.setState({
                    type : "Elève",
                    textDisplay: this.props.res.object.lastname
                })
                break;
            case "quiz":
                this.setState({
                    type : "Quiz",
                    textDisplay: this.props.res.object.quizName
                })
                break;
            case "question":
                this.setState({
                    type : "Question",
                    textDisplay: this.props.res.object.upperText
                })
                break;
        }

    }

    handleDismiss = () => {
        this.props.dismiss()
    }

    handleClick = () => {

        switch (this.props.res.type) {

            case "class":
                this.handleDismiss()
                this.props.redirect(<ClassesDisplay fromSearch={this.props.res.object} />)
                break;

            case "student":
                this.handleDismiss()
                this.props.redirect(<StudentDisplay fromSearch={this.props.res.object} />)
                break;

            case "chapter":
                this.handleDismiss()
                this.props.redirect(<QuestionDisplay fromSearch={{type: "chapter", object: this.props.res.object}} />)
                break;

            case "quiz":
                this.handleDismiss()
                this.props.redirect(<QuestionDisplay fromSearch={{type: "quiz", object: this.props.res.object}} />)
                break;

            case "question":
                this.handleDismiss()
                this.props.redirect(<QuestionDisplay fromSearch={{type: "question", object: this.props.res.object}} />)
                break;

        }

    }

    render() {
        return <div onClick={this.handleClick} className="teacher-search-result-row">
            <h1 className="teacher-search-result-row-text">{this.state.type} : {this.state.textDisplay}</h1>
        </div>;
    }


}