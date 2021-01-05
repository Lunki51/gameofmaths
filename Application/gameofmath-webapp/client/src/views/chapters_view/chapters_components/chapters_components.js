import React, { Component } from 'react';

import Axios from "axios";


export class ChapterSelection extends Component{

    _isMounted=false

    constructor() {
        super();

        this.state = {
            chapters : [],
        }


    }



    componentDidMount() {

        this._isMounted=true

        Axios.post('/api/quiz/getChapter')
            .then((response) =>{
                if(this._isMounted)
                this.setState({
                    chapters : response.data
                })
            })

    }

    componentWillUnmount() {
        this._isMounted=false
    }

    render() {

        return <div className="container-chapter-selection">

            <h1 className="chapter-selection-headline">Chapitres</h1>


            {this.state.chapters.map((mapping, i) => (
                <Chapter text={mapping} key={i} onClick={this.props.onSelection}/>
            ))}


        </div>

    }


}

class Chapter extends Component{


    render() {
        return (
            <input type="button" value={this.props.text} onClick={this.props.onClick} className="container-chapter"/>
        );
    }


}
