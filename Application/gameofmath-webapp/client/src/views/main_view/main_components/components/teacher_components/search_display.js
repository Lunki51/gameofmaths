import {Component} from "react";

export class SearchDisplay extends Component{

    constructor() {
        super();

        this.state = {
            currentFilter:"",
            searchResult:[],
            searchResultElement: null
        }
    }

    handleChange = (event) => {
        console.log(event.target.value)
        if(event.target.value !== ""){

            if(this.state.searchResult.length !== 0){
                this.handleOpenResult()
            }else{
                this.handleNoResult()
            }

        }else{
            this.handleCloseResult()
        }

        this.setState({
            currentFilter: event.target.value
        })
    }

    handleOpenResult = () => {
        this.setState({
            searchResultElement: <div className="teacher-search-result">

            </div>
        })
    }

    handleCloseResult = () => {
        this.setState({
            searchResultElement: null
        })
    }

    handleNoResult = () => {
        this.setState({
            searchResultElement: <div className="teacher-search-no-result">
                <h1 className="teacher-search-no-result-text">Aucun résultat</h1>
            </div>
        })
    }

    render() {
        return <>
                <input placeholder="rechercher" className="teacher-search-input" value={this.state.currentFilter} onChange={this.handleChange}/>
                {this.state.searchResultElement}

                <div onClick={this.props.dismiss} className="dim-background"/>


            </>
    }

}