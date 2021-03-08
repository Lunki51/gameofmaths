import React,{Component} from "react";
import '../../styles/teacher_style.css'

export class NavigationBar extends Component{


    render() {

        return <div className="navigation-teacher-container">
            <img src={window.location.origin + '/logo/banner_gom.png'} className="navigation-teacher-logo"/>
            <button className="navigation-teacher-logout-btn" onClick={this.props.handleLogout} >Déconnexion</button>
        </div>



    }

}
