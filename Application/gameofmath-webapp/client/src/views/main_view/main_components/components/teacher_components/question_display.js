import {Component} from "react";

export class QuestionDisplay extends Component{







    render() {
        return <div className="teacher-default-dashboard-container">

            <div className="teacher-class-list-overview">

                {this.state.classesList.map( (theClass, index) => {
                    return <Ques value={theClass} callbackOverView={this.handleDisplayOverView} key={index} theClass={theClass}/>
                })}

            </div>

            <div className="teacher-class-overview">

                {(this.state.currentOverviewClass)? <ClassOverview theClass={this.state.currentOverviewClass}/> : <h1 className="teacher-no-class">Aucune classe selectionné</h1>}

            </div>

        </div>
    }
}

class QuestionRow extends Component{
    render() {

    }
}