import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Game from "./pages/Game"

function ProtectedRoute({children}){
    const {token} = useAuth();
    return token ? children: <Navigate to="/login" />;
}

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/Dashboard" element={
          <ProtectedRoute><Dashboard/></ProtectedRoute>
        } />
        <Route path="/game/:gameId" element={
          <ProtectedRoute><Game/></ProtectedRoute>
        }/>
        <Route path="/" element={<Navigate to="/login"/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;