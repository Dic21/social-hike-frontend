import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import PageStyle from "../Login.module.css";

import {
  inputRegisterID,
  inputRegisterName,
  inputRegisterPassword,
  logRegisterErrorMessage,
} from "../Slices/registerSlice";
import { logIsLogin } from "../Slices/loginSlice";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { registerID, registerName, registerPassword, registerErrorMsg } =
    useSelector((state) => {
      return state.register;
    });

  const register = () => {
    console.log("register");
    fetch("/register", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({
        id: registerID,
        username: registerName,
        password: registerPassword,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          // console.log(data);
          dispatch(logRegisterErrorMessage(`${data.message}`));
        } else {
          console.log(`Register successfully`);
          dispatch(logRegisterErrorMessage(""));
          dispatch(logIsLogin(true));
          navigate("/login");
        }
      });
  };

  return (
    <div className={PageStyle.wrapper}>
      <div className={PageStyle.login}>
        <div className={PageStyle.titlewrapper}>
          <h1 className={PageStyle.title}>註冊</h1>
        </div>

        <div className={PageStyle.inputWrapper}>
          <div>
            <input
              className={PageStyle.input}
              type="text"
              placeholder="帳號"
              onChange={(e) => {
                dispatch(inputRegisterID(e.target.value));
              }}
            ></input>
          </div>
          <div>
            <input
              className={PageStyle.input}
              type="text"
              placeholder="用戶名稱"
              onChange={(e) => {
                dispatch(inputRegisterName(e.target.value));
              }}
            ></input>
          </div>

          <div>
            <input
              className={PageStyle.password}
              type="password"
              placeholder="密碼"
              onChange={(e) => {
                dispatch(inputRegisterPassword(e.target.value));
              }}
            ></input>
          </div>
        </div>

        <div className={PageStyle.error}>
          {registerErrorMsg === "" ? null : (
            <div className="error">{registerErrorMsg}</div>
          )}
        </div>
        <div>
          <button onClick={register} className={PageStyle.btn}>
            註冊
          </button>
        </div>
        <div className={PageStyle.navigateToRegister}>
          已經有會員帳戶? <Link to="/login"> 按此登入你的帳戶</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
