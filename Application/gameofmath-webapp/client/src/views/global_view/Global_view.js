import React, { Component } from 'react';
import {getMap} from "../../model/mapModel";
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
            map : ""
        }

    }


    componentDidMount(){

        this._isMounted = true

        getMap()
            .then((res) => {

                console.log(res)
            })

        document.title = "Castle | Game Of Math"

        this.setState({
            map:""
        })

        //TODO implement map render


    }


    componentWillUnmount() {
        this._isMounted = false
    }

    render() {

            return <>

                <div className="background">
                    <div id="render">
                        {eval(this.state.map)}
                    </div>
                </div>

            </>





    }
}



export default GlobalView;

