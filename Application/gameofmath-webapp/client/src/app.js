
import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import {Redirect} from 'react-router'
import LoginView from './views/login_view/Login_view.js';
import HomeView from './views/home_view/Home_view.js';
import CastleView from "./views/castle_view/Castle_view";
import QuizView from "./views/quiz_view/Quiz_view";
import {NavigationBar} from "./views/global_components";
import Axios from "axios";


const ProtectedRoute = ({Component : Comp, loggedIn, path, ...rest}) => {

    return <Route
        path={path}
        {...rest}
        render={(props) => {
            return loggedIn ? <Component {...props} /> : <Redirect to={{
                pathname : "/",
                state : {
                    prevLocation : path,
                    error : "login first"
                }
            }} />

        }}
    />;


}

const LoggedRoute = ({Component : Comp, loggedIn, path, ...rest}) => {



    return <Route path={path} {...rest}

        render={(props) => {
            return (!loggedIn) ? <Component {...props} /> : <Redirect to={{
                pathname : "/",
                state : {
                    prevLocation : path,
                    error : "already logged"
                }
            }} />

        }}
    />;


}




// add pages in the Switch component
class App extends Component {


   constructor(props) {
       super(props);

           this.state = {
               logged : false
           }

       Axios.get("/api/isAuth")
           .then((response)=>{

               this.setState({
                   logged : response.data,
               })

           })

   }





    render() {

    const App = () => (
        <div>

          <NavigationBar/>

          <Switch>

              <LoggedRoute    loggedIn={this.state.logged} path="/login"   component={LoginView} />
              <ProtectedRoute loggedIn={this.state.logged} path='/castle'  component={CastleView}/>
              <ProtectedRoute loggedIn={this.state.logged} path="/quiz"    component={QuizView}  />
              <Route path='/' component={HomeView}/>

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