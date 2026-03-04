import Styles from "./Popup.module.css";

export const Popup = (props) => {
  return (
    <div   className={`${Styles["popup"]} ${props.isOpened && Styles["popup_is-opened"]}`}>
      <button className={Styles["close"]} onClick={props.closePopup}>
        {'x'}
      </button>
      <div className={Styles.content}>{props.children}</div>
    </div>
  );
};
