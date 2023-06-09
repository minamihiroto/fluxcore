import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { passwordResetConfirm } from "../../api/authApi";

const PasswordResetConfirm: React.FC = () => {
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { uidb64, token } = useParams<{ uidb64: string; token: string }>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!uidb64 || !token) {
      return;
    }

    try {
      const response = await passwordResetConfirm(uidb64, token, password);
      setMessage(response.data.message);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError("エラーが発生しました。");
    }
  };

  return (
    <div>
      <h2>Password Reset Confirm</h2>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="password">New Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default PasswordResetConfirm;
