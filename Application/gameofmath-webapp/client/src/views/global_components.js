import React, { Component } from 'react';
import "./global_style.css";


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
        
            <div className="container">
                <h1 className="container-title">{this.props.title}</h1>
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
 * create a global navigation bar
 */
class NavigationBar extends Component{

    constructor(props) {
        super(props);
        this.props = props
    }


    render() {
        return <>
            <NavBar>

                <NavElement className="navElem_right" goTo ="/login"  value="Login"/>
                <NavElement className="navElem_left" goTo ="/"  value="home"/>
                <NavElement className="navElem_left" goTo ="/quiz"  value="quiz"/>
                <NavElement className="navElem_left"  goTo ="/castle" value="castle"/>

            </NavBar>
            </>
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

    constructor(props) {
        super(props);
    }


    render() {
        return <>
            <li className={this.props.className}><a className="navbar_link" href={this.props.goTo}>{this.props.value}</a></li>
        </>
    }


}


//exportation
export {ContainerTitle, TextField, Button,NavigationBar};