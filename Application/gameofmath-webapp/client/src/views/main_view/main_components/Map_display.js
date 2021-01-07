import React, { Component } from 'react';
import {render} from '../../../mapRender/mapRenderer'

class MapView extends Component{

    constructor() {
        super();

        this.state = {
            canvas : null
        }

    }


    componentDidMount(){

        render()
            .then((res) => {



            })

    }


    componentWillUnmount() {
        this._isMounted = false
    }

    render() {
        return <></>

    }


}

export default MapView