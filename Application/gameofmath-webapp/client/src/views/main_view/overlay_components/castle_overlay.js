import React, { Component } from 'react';
import '../styles/castle_style.css';
import '../styles/global_style.css'
import '../styles/global_variables.css';
import {getCastleIDs, getCastleInfo} from "../../../model/castleModel";
import {getStudentInfo} from "../../../model/studentModel";

export class CastleDetails extends Component{

    _isMounted=false


    componentDidMount() {
        this._isMounted=true



        getStudentInfo().then(res => {

            getCastleIDs(res.data.classID).then(res => {

                getCastleInfo(res.data.castleIDs[this.props.castle]).then(res => {
                })

            })


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