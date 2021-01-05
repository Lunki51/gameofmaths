import React, { Component } from 'react';



export class Answer extends Component {


    handleClick = (event) => {

        event.target.children[0].checked = !event.target.children[0].checked
        this.props.onChange(event.target.children[0], this.props.text.answerID)
    }


    render() {


        if (this.props.type === "QCM") {
            return <>
                <div className="answer-quiz" onClick={this.handleClick}>
                    <input className="check-box" accept={this.props.text} type="checkbox"/>

                    <label className="check-box-text">{this.props.text.text}</label>
                </div>
            </>
        } else if (this.props.type === "QCU") {
            return <>
                <div className="answer-quiz-qcu" onClick={this.handleClick}>
                    <input className="check-box" name="group" accept={this.props.text} type="radio"/>

                    <label className="check-box-text">{this.props.text.text}</label>
                </div>
            </>
        } else {
            return <>
                <input type="type" value={this.props.parent.state.openAnswer} onChange={this.props.onChange}
                       className="answer-quiz-open" placeholder="Réponse"/>
            </>
        }
    }




}
