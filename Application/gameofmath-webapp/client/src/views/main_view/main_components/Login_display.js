import React, { Component } from 'react';
import {Button, ContainerTitle, TextField} from './components/global_components.js';
import '../styles/login_style.css';
import '../styles/global_style.css'
import '../styles/global_variables.css';



/**
 * @author Antoine LE BORGNE
 *
 * handle and display the login view
 * and manage the login system
 *
 */
class LoginView extends Component {

    _isMounted = false;

    constructor(props) {

        super(props);
        this.state = {username: '', password: '',isLogged:false};
        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        //this.handleLogin = this.handleLogin.bind(this);

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





    componentDidMount(){
        this._isMounted = true;

        document.title = "Login | Game Of Math"
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {

            return <>
                    <ContainerTitle className="container-login" title="GAME OF MATH">
                        <form onSubmit={this.props.handleLogin}>

                            <TextField id="username" value={this.state.username} onChange={this.handleUsernameChange}
                                       hint="NOM D'UTILISATEUR" type="text"/>
                            <TextField id="password" value={this.state.password} onChange={this.handlePasswordChange}
                                       hint="MOT DE PASSE" type="password"/>
                            <Button value="CONNEXION"/>
                        </form>
                    </ContainerTitle>

            </>

    }
}




export default LoginView;