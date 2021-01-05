
import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Axios from "axios";

import {NavigationBar} from "./views/global_components";

import LoginView from './views/login_view/Login_view.js';
import HomeView from './views/home_view/Home_view.js';
import CastleView from "./views/castle_view/Castle_view";
import ChapterView from "./views/chapters_view/Chapters_view";
import QuizView from "./views/quiz_view/Quiz_view";


// add pages in the Switch component
class App extends Component {


   constructor(props) {
       super(props);

           this.state = {
               logged : false
           }


       Axios.post("/api/user/isLogged")
           .then((response)=>{

               this.setState({
                   logged : response.data.isLogged,
               })

           })

   }





    render() {

    const App = () => (
        <div>

          <NavigationBar/>

          <Switch>

              <Route path="/login"      component={LoginView} />
              <Route path='/castle'     component={CastleView}/>
              <Route path="/chapter"    component={ChapterView}  />
              <Route path="/quiz"       component={QuizView}  />
              <Route path='/'           component={HomeView}/>

          </Switch>
        </div>
    )


    return (
        <Switch>
          <App/>
        </Switch>
    );
  }
}



export default App;