import logo from '../images/logo.svg';
import { useNavigate, useLocation } from 'react-router-dom';
import { Routes, Route} from 'react-router-dom'; // импортируем Routes

function Header(props){

  const {userData} = props;

  // подписка на новигацию
  const navigate = useNavigate();
  const location = useLocation();

  // обработчик выхода из профиля
  function liginOut(){
    localStorage.removeItem('jwt');
    navigate('/sign-in');
  }

  // обработчик переход на регистрацию
  function  registrOut(){
    navigate('/sign-up');
  }

  // обработчик выхода из профиля
  function signOut(){
    localStorage.removeItem('jwt');
    navigate('/sign-in');
  }

  return (
    <header className="header">
      <img className="header__logo" src={logo} alt="логотип Mesto"/>
      <nav className="header__menu">
        {location.pathname === "/mesto-react" && <p className="header__menu-login"> { userData }</p>}
        <Routes>

          <Route path="/sign-up" element={ <button onClick={liginOut} className="header__menu-link animation-hover"> Войти </button>}/>
          <Route path="/sign-in" element={ <button onClick={registrOut} className="header__menu-link animation-hover"> Регистрация </button>}/>
          <Route path="/mesto-react" element={ <button onClick={signOut} className="header__menu-link animation-hover"> Выйти </button>}/>

        </Routes>
      </nav>
    </header>
  );
}

export default Header;