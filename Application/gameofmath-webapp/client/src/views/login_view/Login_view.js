import React, { Component } from 'react';
import {Button, ContainerTitle, NavigationBar, TextField} from '../global_components.js';
import auth from '../../model/authentification';
import './styles/login_style.css';
import '../global_style.css'
import '../global_variables.css';

/**
 * @author Antoine LE BORGNE
 *
 * handle and display the login view
 * and manage the login system
 *
 */
class LoginView extends Component {

    constructor(props) {
        super(props);
        this.state = {username: '', password: ''};
        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }


    /**
     * set the new state when ever the user change
     * the username field value
     *
     * @param event mostly onChange
     */
    handleUsernameChange(event) {    
        this.setState({username: document.getElementById("username").value});  
    }


    /**
     * set the new state when ever the user change
     * the password field value
     * @param event mostly onChange
     */
    handlePasswordChange(event) {    
        this.setState({password: document.getElementById("password").value});  
    }

    /**
     * handle submit button and redirect to the
     * authentication handler
     *
     * @param event mostly onClick
     */
    handleSubmit(event) {
        auth(this.state.username,this.state.password);
        event.preventDefault();
    }


    componentDidMount(){
        document.title = "Login | Game Of Math"
    }

    render() {

        return <>
        
            <div className="background">
                <NavigationBar/>
                <ContainerTitle className="container-login" title="LOGIN">
                    <form onSubmit={this.handleSubmit}>
                        <TextField id="username" value={this.state.username} onChange={this.handleUsernameChange} hint="USERNAME" type="text"/>
                        <TextField id="password" value={this.state.password} onChange={this.handlePasswordChange} hint="PASSWORD" type="password"/>
                        <Button value="login"/>
                        </form>
                </ContainerTitle>

            </div>
        </>


    }
}

export default LoginView;