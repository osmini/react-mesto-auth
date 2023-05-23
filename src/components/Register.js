
import { Link } from 'react-router-dom';
import {useState} from 'react';

function Register(props){

  const{name, title, buttonTitle, handleRegistr} = props;

  // данные из формы регистрации
  const [registerName, setRegisterName] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  
  // изменение имени из формы
  function handleName(evt){
    setRegisterName(evt.target.value);
  }

  // изменение о работе из формы
  function handlePassword(evt){
    setRegisterPassword(evt.target.value);
  }

  // отправка данных из формы в апи для регистрации
  function handleSubmit(evt) {
    // Запрещаем браузеру переходить по адресу формы
    evt.preventDefault();
    handleRegistr(registerName, registerPassword)
  }

  return (
    <section className= "aut" id={`popup_${name}`} aria-label="форма попапа">
    
      <h2 className="aut__title">{title}</h2>

      <form className="aut__form" id={`aut_form-${name}`} name={`aut_${name}`} onSubmit={handleSubmit} >

        <input className="aut__form-input"  type="Email"  name="aut_login" autoComplete='email' onChange={handleName} placeholder="Email"/>
        <span className="popup__input-error" id="popup_name-profile-error"></span>
        <input className="aut__form-input"  type="password"  onChange={handlePassword} name="aut_pass"  placeholder="Пароль"/>
        <span className="popup__input-error" id="popup_work-profile-error"></span>

        <button className="aut__form-button aut-batton" type="submit" aria-label="Кнопка регистрации"> {buttonTitle} </button>
        <Link to="/sign-in" className="aut__form-link animation-hover">Уже зарегистрированы? Войти</Link>
      </form>

    </section>
  );

}

export default Register;