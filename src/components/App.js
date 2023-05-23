import {useState, useEffect} from 'react';
import { Routes, Route, useNavigate, useLocation} from 'react-router-dom'; // импортируем Routes
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import ImagePopup  from './ImagePopup';
import Register  from './Register';
import Login   from './Login ';
import EditProfilePopup  from './EditProfilePopup';
import EditAvatarPopup  from './EditAvatarPopup';
import AddPlacePopup   from './AddPlacePopup ';
import InfoTooltip   from './InfoTooltip';
import Api from '../utils/Api';
import ApiAuth from '../utils/ApiAuth';
import ProtectedRoute from "./ProtectedRoute"; // импортируем HOC


// Импортируем объект контекста
import CurrentUserContext from './../contexts/CurrentUserContext';


function App() {

  // открытие попапа
  const [isEditProfilePopupOpen, setleEditProfileClick] = useState(false);
  const [isEditAvatarPopupOpen, setEditAvatarClick] = useState(false);
  const [isAddPlacePopupOpen, setAddPlaceClick] = useState(false);
  const [tooltipPopupOpen, setTooltipPopupOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState({name: '', link: ''});
  const [cards, setCards] = useState([]); //карточки места
  const [currentUser , setCurrentUser ] = useState({}); // текущий пользователя
  const [isLoading, setIsLoading] = useState(false); // состояние кнопки при загрузки данных на сервер
  const [loggenIn, setLoggenIn] = useState(null); // стейт логина
  const [registrIn, setRegistrIn] = useState(false); // стейт регистрации
  const [userData, setUserData] = useState(''); // стейт информации о пользователе

  const navigate = useNavigate();
  const location = useLocation();


  function handleEditProfileClick(){
    setleEditProfileClick(true);
  }

  function handleEditAvatarClick(){
    setEditAvatarClick(true);
  }

  function handleAddPlaceClick(){
    setAddPlaceClick(true);
  }

  function handleTooltipPopupOpen(result){
    setTooltipPopupOpen(result.popup);
    setRegistrIn(result.registr)
  }


  function handleCardClick (selectedCard){
    setSelectedCard(selectedCard);
  }

  // закрытие попапов на крестик
  function closeAllPopups(){
    setleEditProfileClick(false);
    setEditAvatarClick(false);
    setAddPlaceClick(false);
    setSelectedCard({name: '', link: ''})
    setTooltipPopupOpen(false);
  }

  //  обработчик закрытие попап на Escape
  const isOpen = isEditAvatarPopupOpen || isEditProfilePopupOpen || isAddPlacePopupOpen || selectedCard.link || tooltipPopupOpen

  useEffect(() => {
    function closeByEscape(evt) {
      if(evt.key === 'Escape') {
        closeAllPopups();
      }
    }
    if(isOpen) { // навешиваем только при открытии
      document.addEventListener('keydown', closeByEscape);
      return () => {
        document.removeEventListener('keydown', closeByEscape);
      }
    }
  }, [isOpen]) 


  // запрос пользователя с сервера
  useEffect(()=>{
    Api.getInfoUserForServer()
      .then((res) => {
        setCurrentUser(res);
      })
      .catch(err => {
        console.log(err);
      })
  }, []);

  // запрос карточек с сервера
  useEffect(()=>{
    Api.getCardsForServer()
      .then((res) => {
        setCards(res);
      })
      .catch(err => {
        console.log(err);
      })
  }, []);

  // поставить, убрать лайк
  function handleCardLike(card) {

    // Снова проверяем, есть ли уже лайк на этой карточке
    const isLiked = card.likes.some(i => i._id === currentUser._id);

    if (!isLiked) {
      Api.putLikeForServer(card._id)
      .then((newCard) => {
        setCards((state) => state.map((c) => (c._id === card._id ? newCard : c)));
      })
      .catch((err) => {
        console.error(err);
      });  
    } else {
      Api.deleteLikeForServer(card._id)
      .then((newCard) => {
        setCards((state) => state.map((c) => (c._id === card._id ? newCard : c)));
      })
      .catch((err) => {
        console.error(err);
      });  
    }
  }

  // добавить карточку
  function handleAddPlaceSubmit(card) {

    setIsLoading(true);
    Api.postCardsForServer(card)
    .then((newCard) => {
      setCards([newCard, ...cards]); 
      closeAllPopups();
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      setIsLoading(false);
    });  
  }

  // удалить карточку
  function handleCardDelete(card) {

    Api.deleteCardForServer(card._id)
    .then(() => {
      setCards((state) => state.filter((item) => (item._id !== card._id && item)));
    })
    .catch((err) => {
      console.error(err);
    });  
  }

  // обновить данные о пользователе
  function handleUpdateUser(date) {
    setIsLoading(true);
    Api.patchInfoUserForServer(date)
    .then((user) => {
      setCurrentUser(user);
      closeAllPopups();
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      setIsLoading(false);
    });
  }

  // изменить аватар
  function handleUpdateAvatar(date){
    setIsLoading(true);
    Api.patchAvatarForServer(date)
    .then((avatar) => {
      setCurrentUser(avatar);
      closeAllPopups();
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      setIsLoading(false);
    });
  }
  
  // запрос на регистрацию
  function handleRegistr(registerName, registerPassword){
    ApiAuth.postRegistrUser(registerName, registerPassword)
    .then(() =>{
      const result = {
        popup: true,
        registr: true
      };
      handleTooltipPopupOpen(result);
      navigate('/sign-in');
    })
    .catch(() => {
      const result = {
        popup: true,
        registr: false
      };
      handleTooltipPopupOpen(result);
    })
  }

  // запрос  на авторизацию
  function handleLogin(registerName, registerPassword){
    ApiAuth.postAutoriseUser(registerName, registerPassword)
    .then((data) =>{
      localStorage.setItem('jwt', data.token);
      setLoggenIn(true);
      setUserData(registerName);
      navigate('/mesto-react');
    })
    .catch(() => {
      const result = {
        popup: true,
        registr: false
      }
      handleTooltipPopupOpen(result)
    })
  }

  // проверяем токен при первой загрузки
  useEffect(()=>{
    const jwt = localStorage.getItem('jwt');
    ApiAuth.getCheakTokenUser(jwt)
    .then((data) =>{
      if(data){
        setLoggenIn(true);
        setUserData(data.data.email);
        navigate(location.pathname);
      } else {
        setLoggenIn(false);
      }
    })
  }, []);

  /*// прием показывающий что страница перезагружается, а не просто страница "дергается при перерисовки"
    // у меня не вышло, при такой записи когда ключь пустой, тгогда вообще не пускает на авторизацию
  if (loggenIn === null) {
    return (<div>Loading...</div>);
  }*/

  return (

    <CurrentUserContext.Provider value={currentUser}>
    
      <Header userData={userData} />

        <Routes>

          <Route path="/mesto-react" element={
            <ProtectedRoute element={
              <Main 
                onEditProfile = {handleEditProfileClick}
                onEditAvatar = {handleEditAvatarClick} 
                onAddPlace = {handleAddPlaceClick}  
                onCardClick = {handleCardClick}
                onCardLike = {handleCardLike}
                onCardDelete = {handleCardDelete}
                cards = {cards}
              />} 
              loggenIn={loggenIn} 
            />
          }/>

          <Route path="/sign-up" element={ 
            <Register 
              name = 'register'
              title = 'Регистрация'
              buttonTitle = 'Зарегистрироваться'
              handleRegistr = {handleRegistr}
            />
          }/>

          <Route path="/sign-in" element={ 
            <Login 
              name = 'login'
              title = 'Вход'
              buttonTitle = 'Войти'
              handleLogin = {handleLogin}
            />
          }/>

        <Route path="*" element= {<h2> Not found</h2>}/>

      </Routes>
              
      <EditProfilePopup isOpen={isEditProfilePopupOpen} onClose={closeAllPopups} onUpdateUser={handleUpdateUser} isLoading={isLoading}/>
      <EditAvatarPopup isOpen={isEditAvatarPopupOpen} onClose={closeAllPopups} onUpdateAvatar={handleUpdateAvatar} isLoading={isLoading}/>
      <AddPlacePopup  isOpen={isAddPlacePopupOpen} onClose={closeAllPopups} onAddPlace={handleAddPlaceSubmit} isLoading={isLoading}/>
      <ImagePopup card = {selectedCard} onClose = {() => closeAllPopups()}/> 
      <InfoTooltip isOpen={isAddPlacePopupOpen} onClose={closeAllPopups} tooltipPopupOpen={tooltipPopupOpen} registrIn={registrIn}/> 
      <Footer />  

    </CurrentUserContext.Provider>
  );
}

export default App;
