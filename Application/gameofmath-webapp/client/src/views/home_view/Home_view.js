import React, { Component } from 'react';
import './styles/home_style.css';
import '../global_style.css'
import '../global_variables.css';
import {NavBar,NavElement} from './home_components/home_components'
import {NavigationBar} from "../global_components";

/**
 * @author Antoine LE BORGNE
 *
 * handle and display home view
 */
class HomeView extends Component {


    componentDidMount(){
        document.title = "Home | Game Of Math"
    }

    render() {

        return <>
               <NavigationBar/>
               <h1 className="homeTitle">GAME OF MATH</h1>
        </>


    }
}

export default HomeView;