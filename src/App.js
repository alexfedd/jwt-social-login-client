import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Signin from "./signin/Signin";
import Signup from "./signup/Signup";
import Profile from "./profile/Profile";
import Chat from "./chat/Chat";
import "./App.css";
import { HashRouter } from "react-router-dom/cjs/react-router-dom";

export const AppContext = React.createContext();
const App = (props) => {
  return (
    <div className="App">
      <HashRouter>
        <Switch>
          <Route exact path="/" render={(props) => <Profile {...props} />} />
          <Route
            exact
            path="/login"
            render={(props) => <Signin {...props} />}
          />
          <Route
            exact
            path="/signup"
            render={(props) => <Signup {...props} />}
          />
          <Route exact path="/chat" render={(props) => <Chat {...props} />} />
        </Switch>
      </HashRouter>
    </div>
  );
};

export default App;
