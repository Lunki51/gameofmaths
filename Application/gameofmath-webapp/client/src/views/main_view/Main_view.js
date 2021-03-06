import React, {Component} from 'react';

//MODEL
import auth, {getType, getUsername, isAuth} from "../../model/authentification";

import LoginView from "./main_components/Login_display";
import {MobileHeader, NavigationBar, Warning} from "./main_components/components/global_components";
import MapView from "./main_components/Map_display";
import Axios from "axios";
import {Quiz} from "./overlay_components/chapters_overlay";
import {TeacherDisplay20} from "./main_components/teacher_display_2.0";
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
            errorMsg:null,
            whatOnOverlay: "",
            mapAccess: true,
            who: "",
            username: "",
            zoomed: false,
            details: null,
            profile: null,
            loading:<div className="background-loading"/>
        }


    }


    componentDidMount() {

        this._isMounted = true


        //Check if the user is authenticated
        isAuth().then((res) => {

                if (this._isMounted) {
                    if (res.data.returnState === 0) {
                        if (res.data.isLogged === true) {
                            document.title = "Game Of Math"
                        }
                        if(res.data.isLogged){
                            getType().then((response) => {

                            if (response.data.returnState === 0) {
                                this.setState({
                                    isLogged: res.data.isLogged,
                                    who: response.data.type
                                })
                            }

                            })
                        }else{
                            this.setState({
                                isLogged: res.data.isLogged,
                            })
                        }



                    }
                }
            })

    }


    //HANDLER

    handleDisplayErrorMsg = (msg) => {
        this.setState({
            errorMsg: <Warning msg={msg} okClick={this.closeWarning}/>
        })
    }

    handleDisplayWarning = (msg, validate) => {
        this.setState({
            errorMsg: <>
                <div className="blur-background"/>
                <Warning msg={msg} cancel={this.closeWarning} okClick={validate}/>
                </>
        })
    }

    closeWarning = () => {
        this.setState({
            errorMsg:null
        })
    }

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
                    this.handleDisplayErrorMsg(response.data.msg)

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
                    isLogged: false,
                    zoomed: false,
                    details: null,
                    profile: null
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

    handleProfileDisplay = () => {
        if(this.state.profile){
            this.setState({
                profile:null
            })
        }else{
            this.setState({
                profile: <ProfilDetails/>
            })
        }
    }

    handleCastleDetails = (castle) => {




        this.setState({details: <CastleDetails castle={castle} clear={this.handleClearDetails}/>, zoomed: true})
    }


    handleClearDetails = () => {
        this.setState({details: null, zoomed: false})
    }


    componentWillUnmount() {
        this._isMounted = false
    }

    finishLoading =()=>{
        this.setState({loading:null})
    }

    render() {

        if (this.state.isLogged === true) {
            //the user is logged

            if (this.state.who === "student") {

                //user is a student
                return <>
                    <MobileHeader/>{/*appear only when mobile*/}
                    <NavigationBar quiz={this.handleQuizDisplay} profile={this.handleProfileDisplay}
                                   logout={this.handleLogout}/>
                    {this.state.loading}
                    <MapView details={this.handleCastleDetails} zoomed={this.state.zoomed} finishLoading={this.finishLoading}/>
                    {this.state.details}
                    {this.state.profile}
                    {this.state.overlayComponent}
                </>

            } else {

                //user is a teacher
                return <>

                    <TeacherDisplay20 displayWarning={this.handleDisplayWarning} displayError={this.handleDisplayErrorMsg} logout={this.handleLogout}/>
                    {this.state.errorMsg}

                </>

            }

        } else {

            //the user is not logged

            return <>

                <LoginView handleLogin={this.handleLogin}/>
                {this.state.errorMsg}
            </>

        }


    }


}


export default MainView;