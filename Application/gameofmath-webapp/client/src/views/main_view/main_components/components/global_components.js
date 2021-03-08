import React, { Component } from 'react';
import "../../styles/global_style.css";
import {getUsername} from "../../../../model/authentification";


//IMAGES

const image_icon_user =  "https://img.icons8.com/material-outlined/35/eff0cf/user--v1.png"
const image_icon_logout =  "https://img.icons8.com/ios-filled/35/eff0cf/login-rounded-right.png"
const image_icon_quiz =  "https://img.icons8.com/ios/35/eff0cf/help.png"

/**
 * @author Antoine LE BORGNE
 *
 * create a main container component
 */
class ContainerTitle extends Component{

    constructor(props){
        super(props)
        this.props = props;
    }


    render(){

        return<>
        
            <div className={this.props.className}>
                <img className="container-title" src={window.location.origin + "/logo/game_of_math_logo.png"}/>
                {this.props.children}
            </div>
        
        </>

    }



}


/**
 * @author Antoine LE BORGNE
 *
 * create a text field component
 */
class TextField extends Component {


    constructor(props){
        super(props)
        this.props = props;
    }

    render(){
        return <>
            <input id={this.props.id} onChange={this.props.onChange} value={this.props.value} className="textField" placeholder={this.props.hint} type={this.props.type}/>
        </>
    }


}


/**
 * @author Antoine LE BORGNE
 *
 * create a simple Button component
 */
class Button extends Component{


    constructor(props){
        super(props)
        this.props = props;
    }

    render(){
        return <>
             <input className="button" type="submit" value={this.props.value} onClick={this.props.onClick}/> 
        </>
    }

}


/**
 * @author Antoine LE BORGNE
 *
 * create the navigation bar
 */
class NavigationBar extends Component{


    _isMounted = false;

    constructor(props) {
        super(props);
        this.props = props

        this.state = {
            username : ""
        }

    }


    componentDidMount() {

        this._isMounted = true;

            //get the current username
            getUsername().then((response) => {

                    if(this._isMounted) {

                        this.setState({
                            username: response.data.username,
                        })

                    }
                })

    }



    componentWillUnmount() {
        this._isMounted = false;
    }


    render() {
        return <NavBar>
                    <NavElement icon={image_icon_quiz} id="quiz-btn"  className="navElem_left"   onClick={this.props.quiz} value="quiz"/>
                    <img src={window.location.origin + '/logo/banner_gom.png'} className="navElem_center"/>
                    <NavElement icon={image_icon_user}  className="navElem_right"  onClick={this.props.profile} value={this.state.username}/>
                    <NavElement icon={image_icon_logout}  className="navElem_right"  onClick={this.props.logout} value="deconnexion"/>
                </NavBar>
    }

}


/**
 * @author Antoine LE BORGNE
 *
 * handle and display navbar
 */
export class NavBar extends Component{

    constructor(props){
        super(props);
        this.props = props;
    }


    render(){
        return <>
            <ul className="navbar_container">
                {this.props.children}
            </ul>
        </>
    }

}

/**
 * @author Antoine LE BORGNE
 *
 * manage navigation element
 */
export class NavElement extends Component{


    render() {
        return <>
            <li className={this.props.className}>

                <img id={this.props.id} className="navbar_link_icon" onClick={this.props.onClick} src={this.props.icon}/>
                <a className="navbar_link" onClick={this.props.onClick}>
                    {this.props.value}
                </a>
            </li>
        </>
    }


}


export class Warning extends Component{


    render() {

        return <div className="alert_container">
            <text className="warning_msg">{this.props.msg}</text>

            <div className="warning_btn_section">
            {(this.props.cancel) ?
                <>
                    <button className="warning_ok_btn"  onClick={this.props.okClick}>Ok</button>
                    <button className="warning_cancel_btn" onClick={this.props.cancel}>Annuler</button>
                </>
                :
                <button className="warning_ok_btn" onClick={this.props.okClick}>OK</button>
            }
            </div>
        </div>


    }

}



export class MobileHeader extends Component{

    render() {

        return <div className="mobile-header-container">

            <img src={window.location.origin + '/logo/game_of_math_logo.png'} className="mobile-header-title"/>

        </div>
    }

}



//exportation
export {ContainerTitle, TextField, Button,NavigationBar};