import React, { useState, useEffect } from "react";
import { loginUser, activateAccount } from "../../api/authApi";
import { useNavigate, useLocation, Link } from "react-router-dom";
import styles from "./style/Login.module.css";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    const activateUserAccount = async () => {
      const queryParams = new URLSearchParams(location.search);
      const user_id_b64 = queryParams.get("user_id_b64");
      const token = queryParams.get("token");

      if (!user_id_b64 || !token) {
        return;
      }

      await activateAccount(user_id_b64, token);
      setMessage("アカウントが有効化されました。ログインしてください。");
    };

    activateUserAccount();
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await loginUser(username, password);
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
      setMessage("ログインに失敗しました。");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Login</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          ログイン
        </button>
      </form>
      <Link to={"/password-reset"} className={styles.link}>
        パスワードを忘れた方へ
      </Link>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default Login;
