import React, { Component } from 'react';
import './styles/home_style.css';
import '../global_style.css'
import '../global_variables.css';


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
               <h1 className="homeTitle">GAME OF MATH</h1>
        </>


    }
}

export default HomeView;