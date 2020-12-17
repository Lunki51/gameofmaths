
import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import LoginView from './views/login_view/Login_view.js';
import HomeView from './views/home_view/Home_view.js';
import CastleView from "./views/castle_view/Castle_view";
import QuizView from "./views/quiz_views/Quiz_view";

// add pages in the Switch component
class App extends Component {
  render() {
    const App = () => (
        <div>
          <Switch>

            <Route exact path='/login' >
              <LoginView/>
            </Route>

              <Route path='/castle' >
                  <CastleView/>
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

export default App;