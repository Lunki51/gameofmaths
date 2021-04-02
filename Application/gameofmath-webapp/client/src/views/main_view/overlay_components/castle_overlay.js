import React, { Component } from 'react';
import '../styles/castle_style.css';
import '../styles/global_style.css'
import '../styles/global_variables.css';
import {getCastleInfo} from "../../../model/castleModel";

export class CastleDetails extends Component{

    _isMounted=false


    componentDidMount() {
        this._isMounted=true

        getCastleInfo(this.props.castle).then(res => {
            console.log(res)
        })

    }

    componentWillUnmount() {
        this._isMounted=false

    }

    render() {

        //TODO Implement castle description when db is done
        return <div className="container-castle-details">

            <h1 className="castle-details-headline">Castle N°{this.props.castle}</h1>

            <button className="castle-back-to-height" onClick={this.props.clear}>Retour</button>

            <div className="castle-details-container">

            </div>

        </div>

    }




}