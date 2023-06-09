import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Breadcrumbs from "./Breadcrumbs";
import styles from "./style/HeaderMenu.module.css";
import { Link, useNavigate } from "react-router-dom";
import { checkLoggedIn } from "../../api/authApi";

interface MenuProps {}

const HeaderMenu: React.FC<MenuProps> = () => {
  const location = useLocation();
  const pathMatch = location.pathname.match(
    /^\/(?:directory|document|box)\/(\d+)$/
  );

  const [directoryId, setDirectoryId] = useState<number | undefined>();
  const [documentId, setDocumentId] = useState<number | undefined>();
  const [boxId, setBoxId] = useState<number | undefined>();
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (pathMatch) {
      const id = parseInt(pathMatch[1], 10);
      if (location.pathname.startsWith("/directory")) {
        setDirectoryId(id);
        setDocumentId(undefined);
        setBoxId(undefined);
      } else if (location.pathname.startsWith("/document")) {
        setDocumentId(id);
        setDirectoryId(undefined);
        setBoxId(undefined);
      } else if (location.pathname.startsWith("/box")) {
        setBoxId(id);
        setDirectoryId(undefined);
        setDocumentId(undefined);
      }
    } else {
      setDirectoryId(undefined);
      setDocumentId(undefined);
      setBoxId(undefined);
    }
  }, [location.pathname, pathMatch]);

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const response = await checkLoggedIn();
        if (!response.data) {
          navigate("/login");
        }
        setUsername(response.data.username);
        localStorage.setItem("user_id", response.data.id);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    getUserInfo();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isHomePage = location.pathname === "/";
  const isMyPage = location.pathname === "/setting";
  let showBreadcrumbs = false;
  if (pathMatch && (directoryId || documentId || boxId)) {
    showBreadcrumbs = true;
  }

  return (
    <div className={styles.headerMenuContainer}>
      {showBreadcrumbs && (
        <div className={styles.breadcrumbsContainer}>
          <Breadcrumbs
            directoryId={directoryId}
            documentId={documentId}
            boxId={boxId}
          />
        </div>
      )}
      {isHomePage && <div>Home</div>}
      {isMyPage && <div>マイページ</div>}
      {!showBreadcrumbs && !isHomePage && <p></p>}
      <Link to="/setting" className={styles.userInfo}>
        {username}
      </Link>
    </div>
  );
};

export default HeaderMenu;
