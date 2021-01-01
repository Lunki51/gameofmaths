import React, { Component } from 'react';
import "./global_style.css";
import Axios from "axios";


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


    _isMounted = false;

    constructor(props) {
        super(props);
        this.props = props

        this.state = {
            login : false,
            username : ""
        }

    }


    componentDidMount() {
        this._isMounted = true;


        Axios.get("/api/isAuth")
            .then((response) => {


                if(this._isMounted)
                    this.setState({
                        login: response.data,
                    })

            })


        Axios.get('/api/sessionUsername')
            .then((response) => {
                if(this._isMounted)
                    this.setState({
                        username: response.data,
                    })

            })

    }

    componentWillUnmount() {
        this._isMounted = false;
    }


    render() {
        return <>

            <NavBar>

                {this.state.login ? <Login username={this.state.username} /> : <NotLogin/>}

            </NavBar>
            </>
    }

}

class NotLogin extends Component{

    render() {
        return <>
            <NavElement id="" className="navElem_right" goTo ="/login"  value="Login"/>
            <NavElement id="" className="navElem_left" goTo ="/"  value="home"/>
        </>
    }

}


class Login extends Component{



    render() {
        return <>
            <NavElement id="" className="navElem_right"  goTo ={"/profile/" + this.props.username}  value={this.props.username}/>
            <NavElement id="" className="navElem_right"  goTo="/" onClick={() => {
                Axios.get("/api/logout")
                    .then((response)=>{


                        this.setState({
                            login : false,
                        })

                    })
            }
            } value="logout"/>
            <NavElement id="" className="navElem_left"   goTo ="/"  value="home"/>
            <NavElement id="" className="navElem_left"   goTo ="/quiz"  value="quiz"/>
            <NavElement id="" className="navElem_left"   goTo ="/castle" value="castle"/>
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



    render() {
        return <>
            <li className={this.props.className}><a className="navbar_link" onClick={this.props.onClick} href={this.props.goTo}>{this.props.value}</a></li>
        </>
    }


}


//exportation
export {ContainerTitle, TextField, Button,NavigationBar};