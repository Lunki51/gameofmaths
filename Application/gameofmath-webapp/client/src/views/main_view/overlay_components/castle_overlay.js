import React, { Component } from 'react';
import '../styles/castle_style.css';
import '../styles/global_style.css'
import '../styles/global_variables.css';

export class CastleDetails extends Component{

    _isMounted=false


    componentDidMount() {
        this._isMounted=true
    }

    componentWillUnmount() {
        this._isMounted=false
    }
    render() {

        //TODO Implement castle description when db is done
        return <div className="container-castle-details">

            <h1 className="castle-details-headline">Castle N {this.props.castle}</h1>

            <button onClick={this.props.clear}>Retour</button>
        </div>

    }




}