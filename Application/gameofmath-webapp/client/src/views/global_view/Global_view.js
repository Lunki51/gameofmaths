import React, { Component, useRef, useEffect } from 'react';
import {getMap} from "../../model/mapModel";
import Axios from "axios";
/* eslint no-eval: 0 */

/**
 * @author Antoine LE BORGNE
 *
 * handle and display main castle view
 */
class GlobalView extends Component {


    _isMounted = false

    constructor() {
        super();

        this.state = {
            instance: React.createRef()
        }

    }


    componentDidMount(){

        this._isMounted = true

        document.title = "Castle | Game Of Math"

        const scriptRenderer = document.createElement("script");
        const scriptThree = document.createElement("script");
        scriptRenderer.src = "http://localhost:5000/graphics/renderer"
        this.state.instance.current.appendChild(scriptRenderer);

        //TODO implement map render


    }


    componentWillUnmount() {
        this._isMounted = false
    }

    render() {

            return <>

                <div className="background">
                    <div ref={this.state.instance}/>
                </div>

            </>

    }
}



export default GlobalView;

