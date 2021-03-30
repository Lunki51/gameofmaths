import React, {Component} from 'react';

//MODEL
import auth, {getType, getUsername, isAuth} from "../../model/authentification";

import LoginView from "./main_components/Login_display";
import {MobileHeader, NavigationBar} from "./main_components/components/global_components";
import MapView from "./main_components/Map_display";
import Axios from "axios";
import {Quiz} from "./overlay_components/chapters_overlay";
import {TeacherDisplay} from "./main_components/teacher_display";
import {CastleDetails} from "./overlay_components/castle_overlay"
import {ProfilDetails} from "./overlay_components/profil_overlay";
import {quitQuiz} from "../../model/quizModel";

/**
 * @author ANtoine LE BORGNE
 *
 * create the main of the app
 */
class MainView extends Component {


    _isMounted = false

    constructor() {

        super();


        this.state = {

            isLogged: () => {
                isAuth()
                    .then((res) => {
                        return res.data.isLogged
                    })
            },
            overlayComponent: null,
            whatOnOverlay: "",
            mapAccess: true,
            who: "",
            username: "",
            zoomed: false,
            details: null,
        }


    }


    componentDidMount() {

        this._isMounted = true


        //Check if the user is authenticated
        isAuth()
            .then((res) => {

                if (this._isMounted) {
                    if (res.data.returnState === 0) {
                        if (res.data.isLogged === true) {
                            document.title = "Game Of Math"
                        }

                        getType().then((response) => {

                            if (response.data.returnState === 0) {
                                this.setState({
                                    isLogged: res.data.isLogged,
                                    who: response.data.type
                                })
                            }

                        })


                    }
                }
            })

    }


    //HANDLER

    /**
     * handle submit button and redirect to the
     * authentication handler
     *
     * @param event mostly onClick
     */
    handleLogin = (event) => {

        //get input's form values
        const username = event.target[0].value
        const password = event.target[1].value

        //check authentication
        auth(username, password)
            .then((response) => {
                //if wrong password or login

                if (response.data.returnState === 1) {
                    //TODO put styled error message
                    alert(response.data.msg)

                } else if (response.data.returnState === 0) {
                    isAuth()
                        .then((res) => {
                            if (res.data.returnState === 0) {
                                document.title = "Game Of Math"
                                this.setState({
                                    isLogged: res.data.isLogged,
                                    who: response.data.type
                                })

                            }
                        })
                }

            })


        event.preventDefault();

    }

    /**
     * handle the logout of the user
     *
     */
    handleLogout = () => {

        Axios.post("/api/user/logout").then((res) => {

            if (res.data.returnState === 0)
                this.setState({
                    isLogged: false
                })
        })
    }

    /**
     *handle the quiz visibility
     */
    handleQuizDisplay = () => {

        if (this.state.whatOnOverlay === "quiz") {

            document.getElementById('quiz-btn').style.shadowfilter = "none"

            this.setState({
                overlayComponent: null,
                whatOnOverlay: ""
            })
        } else {
            document.getElementById('quiz-btn').style.shadowfilter = "filter : drop-shadow(0px 0px 0px 3px #fff);"
            this.setState({
                overlayComponent: <Quiz/>,
                whatOnOverlay: "quiz"
            })
        }

    }

    handleProfilDisplay = () => {
        if (this.state.whatOnOverlay === "quiz") {
            this.handleQuizDisplay();
        }
        if (this.state.whatOnOverlay === "profil") {
            this.setState({
                overlayComponent: null,
                whatOnOverlay: ""
            })
        } else {
            this.setState({
                overlayComponent: <ProfilDetails/>,
                whatOnOverlay: "profil"
            })

        }
    }

    handleCastleDetails = (castle) => {
        this.setState({details: <CastleDetails castle={castle} clear={this.handleClearDetails}/>, zoomed: true})
        console.log("Added details")
    }


    handleClearDetails = () => {
        this.setState({details: null, zoomed: false})
        console.log("Removed details")
    }


    componentWillUnmount() {
        this._isMounted = false
    }


    render() {

        if (this.state.isLogged === true) {
            //the user is logged

            if (this.state.who === "student") {

                //user is a student
                return <>

                    <MobileHeader/>{/*appear only when mobile*/}
                    <NavigationBar quiz={this.handleQuizDisplay} prof={this.handleProfilDisplay}
                                   logout={this.handleLogout}/>
                    <MapView details={this.handleCastleDetails} zoomed={this.state.zoomed}/>
                    {this.state.details}
                    {this.state.overlayComponent}
                </>

            } else {

                //user is a teacher
                return <TeacherDisplay logout={this.handleLogout}/>

            }

        } else {

            //the user is not logged
            return <LoginView handleLogin={this.handleLogin}/>

        }


    }


}


export default MainView;