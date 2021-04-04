import React, { Component } from 'react';
import * as THREE from 'three'
import { FBXLoader } from '../../../../node_modules/three/examples/jsm/loaders/FBXLoader.js';
import { TGALoader } from '../../../../node_modules/three/examples/jsm/loaders/TGALoader';
import { OrbitControls } from '../../../../node_modules/three/examples/jsm/controls/OrbitControls.js';
import '../styles/global_style.css'
import auth, {getInfo, getType, getUsername, isAuth} from "../../../model/authentification";
import '../styles/global_variables.css';
import {getRemainingDailyQuestion} from "../../../model/studentModel";
import {getRemainingQuiz} from "../../../model/quizModel";

export class ProfilDetails extends Component{

    _isMounted=false


    constructor() {
        super();
        this.state = {
            player: {firstname:"", lastname:"", className:"", classGrade:"", classID:0, mp:0},
            remainingQuiz: 0,
        }
        getInfo().then(response =>{
            this.setState({player : response.data})
            console.log(this.state.player)
        })
    }


    componentDidMount() {
        this._isMounted=true
        // getRemainingQuiz().then(res => {
        //
        //     console.log(res)
        //
        // })
    }

    componentWillUnmount() {
        this._isMounted=false
    }



    render() {

        //TODO Implement player description
        return <div className="container-profile-details">

            <h1 className="profile-details-headline">Joueur : {this.state.player.firstname} {this.state.player.lastname}</h1>
            <h1 className="profile-details">Classe: {this.state.player.className}</h1>
            <h1 className="profile-details">Points de math : {this.state.player.mp}</h1>
            <h1 className="profile-details">Quiz restant : {this.state.remainingQuiz}</h1>

        </div>

    }




}