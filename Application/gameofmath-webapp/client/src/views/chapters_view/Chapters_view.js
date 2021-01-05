import React, { Component } from 'react';


import './styles/chapters_style.css';
import '../global_style.css'
import '../global_variables.css';
import {ChapterSelection} from "./chapters_components/chapters_components";
import {isAuth} from '../../model/authentification'
import {Redirect} from "react-router";

/**
 * @author Antoine LE BORGNE
 *
 *
 */
class ChapterView extends Component {

    _isMounted = false;


    constructor(props) {
        super(props);

        this.state = {
            hasClick : false,
            dataClick : null,
            isLogged : () => {
                isAuth().then((response) => {

                      return response.data.isLogged

                })
            }
        }





    }

    componentDidMount() {
        document.title = "Chapter | Game Of Math"

        this._isMounted = true;


    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handleSelection = (event) =>{

        if(this._isMounted)
        this.setState({

            dataClick : event.target.value,
            hasClick : true,

        })

    }


    render() {


        if(this.state.isLogged){

            if(this.state.hasClick){
                return <Redirect to={{pathname:"/quiz",state:{ chapter : this.state.dataClick}}}/>
            }else{

                return <div className="background">
                    <ChapterSelection onSelection={this.handleSelection}/>
                </div>
            }

        }else{
            return <Redirect to="/">


            </Redirect>
        }







    }
}




export default ChapterView;