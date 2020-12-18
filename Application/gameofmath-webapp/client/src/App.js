
import React, { Component , useState} from 'react';
import { Route, Switch } from 'react-router-dom';
import LoginView from './views/login_view/Login_view.js';
import HomeView from './views/home_view/Home_view.js';
import CastleView from "./views/castle_view/Castle_view";
import QuizView from "./views/quiz_view/Quiz_view";

// add pages in the Switch component
class App extends Component {




  render() {


    const App = () => (
        <div>
          <Switch>

            <Route exact path='/login' >
              <LoginView/>
            </Route>

              <Route path='/castle'  component={CastleView}>

              </Route>

              <Route path='/quiz' >
                  <QuizView/>
              </Route>


              <Route path='/' >
              <HomeView/>
            </Route>

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


function displayAuth(auth){

    if(auth){
        return
    }


}


export default App;