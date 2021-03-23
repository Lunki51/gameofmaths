import React, { Component } from 'react';

export class CastleDetails extends Component{

    _isMounted=false

    constructor() {
        super();
    }

    componentDidMount() {
        this._isMounted=true
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