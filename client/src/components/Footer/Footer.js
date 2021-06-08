import React, { Component } from "react";
import styles from "./Footer.module.scss";

class Footer extends Component {
  render() {
    return (
      <div className={styles.footer}>
        <div className={styles.footerLinkWrapper}>
          <a href="https://mokancode.com" target="_blank">
            {"Designed & developed by"}
            <p>
              MoKanCode<span>MoKanCode</span>
            </p>
          </a>
        </div>
      </div>
    );
  }
}

export default Footer;
