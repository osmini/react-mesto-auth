import {useState, useEffect} from 'react';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import ImagePopup  from './ImagePopup';
import EditProfilePopup  from './EditProfilePopup';
import EditAvatarPopup  from './EditAvatarPopup';
import AddPlacePopup   from './AddPlacePopup ';
import Api from '../utils/Api';

// Импортируем объект контекста
import CurrentUserContext from './../contexts/CurrentUserContext';


function App() {

  // открытие попапа
  const [isEditProfilePopupOpen, setleEditProfileClick] = useState(false);
  const [isEditAvatarPopupOpen, setEditAvatarClick] = useState(false);
  const [isAddPlacePopupOpen, setAddPlaceClick] = useState(false);
  const [selectedCard, setSelectedCard] = useState({name: '', link: ''});
  const [cards, setCards] = useState([]); //карточки места
  const [currentUser , setCurrentUser ] = useState({}); // текущий пользователя
  const [isLoading, setIsLoading] = useState(false); // состояние кнопки при загрузки данных на сервер


  function handleEditProfileClick(){
    setleEditProfileClick(true);
  }

  function handleEditAvatarClick(){
    setEditAvatarClick(true);
  }

  function handleAddPlaceClick(){
    setAddPlaceClick(true);
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
  }

  //  обработчик закрытие попап на Escape
  const isOpen = isEditAvatarPopupOpen || isEditProfilePopupOpen || isAddPlacePopupOpen || selectedCard.link

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
  
  return (

    <CurrentUserContext.Provider value={currentUser}>
          
      <Header />
      
      <Main 
        onEditProfile = {handleEditProfileClick}
        onEditAvatar = {handleEditAvatarClick} 
        onAddPlace = {handleAddPlaceClick}  
        onCardClick = {handleCardClick}
        onCardLike = {handleCardLike}
        onCardDelete = {handleCardDelete}
        cards = {cards}
      />

      <EditProfilePopup isOpen={isEditProfilePopupOpen} onClose={closeAllPopups} onUpdateUser={handleUpdateUser} isLoading={isLoading}/>
      <EditAvatarPopup isOpen={isEditAvatarPopupOpen} onClose={closeAllPopups} onUpdateAvatar={handleUpdateAvatar} isLoading={isLoading}/>
      <AddPlacePopup  isOpen={isAddPlacePopupOpen} onClose={closeAllPopups} onAddPlace={handleAddPlaceSubmit} isLoading={isLoading}/>
      <ImagePopup card = {selectedCard} onClose = {() => closeAllPopups()}/> 
      
      <Footer />  

    </CurrentUserContext.Provider>
  );
}

export default App;
