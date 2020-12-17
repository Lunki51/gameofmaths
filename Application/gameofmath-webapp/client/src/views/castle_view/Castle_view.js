import React, { Component } from 'react';


/**
 * @author Antoine LE BORGNE
 *
 * handle and display main castle view
 */
class CastleView extends Component {


    componentDidMount(){

        document.title = "Castle | Game Of Math"


        //TODO implement map render
        fetch('/api/graphics/renderer')
            .then(res => res.text())
            .then(text => {
               eval(text)
            });

    }

    render() {

        return <>

            <div className="background">
                <div id="render">

                </div>
            </div>
        </>



    }
}



export default CastleView;

