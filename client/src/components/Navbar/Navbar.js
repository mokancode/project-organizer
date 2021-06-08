import React, { Component } from "react";
import classnames from "classnames";
import isEmpty from "../../validation/is-empty";
import "./Navbar.css";
import { connect } from "react-redux";
import { toggleNeonTheme } from "../../actions/styleActions";
import ToggleButton from "../ToggleButton/ToggleButton";

export class Navbar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      removeCategoryConfirmTimeoutEnded: false,
      removeProjectConfirmTimeoutEnded: false,
    };

    this.addCategory = this.props.addCategory;
    this.addCategoryShortcut = this.props.addCategoryShortcut;
    this.setCurrentCategory = this.props.setCurrentCategory;
    this.removeCategory = this.props.removeCategory;

    this.addProject = this.props.addProject;
    this.addProjectShortcut = this.props.addProjectShortcut;
    this.setCurrentProject = this.props.setCurrentProject;
    this.removeProject = this.props.removeProject;
    this.exportData = this.props.exportData;
    this.importData = this.props.importData;

    // refs
    this.categoryInputRef = React.createRef();
    this.projectInputRef = React.createRef();
    this.projectListRef = React.createRef();
    this.categoryListRef = React.createRef();
    this.importDataBtnRef = React.createRef();
  }

  componentDidMount() {
    window.addEventListener("keyup", (e) => {
      const { navbarOpen, openProjectsList, openCategoriesList } = this.state;
      const { uploadCancelled } = this.state;
      // console.log("e", e);
      if (e.key === "Escape" && !this.props.styles.ignoreNavbarShortcuts) {
        // console.log(navbarOpen, navbarOpen, openProjectsList, openCategoriesList);
        if (navbarOpen && uploadCancelled !== true) {
          this.setState({
            navbarOpen: false,
            openProjectsList: false,
            openCategoriesList: false,
            openAddProject: false,
            openAddCategory: false,
            projectInputErrorAnim: false,
            categoryInputErrorAnim: false,
          });
        } else if (!navbarOpen && !openProjectsList && !openCategoriesList) {
          this.setState({ navbarOpen: true });
        } else if (!navbarOpen && (openProjectsList || openCategoriesList))
          this.setState({ openProjectsList: false, openCategoriesList: false });
      } else if (!navbarOpen) {
        if (document.activeElement.tagName === "TEXTAREA" || document.activeElement.tagName === "INPUT") return;
        if (e.key === "1") {
          if (openProjectsList) {
            this.setState({ openProjectsList: false });
            if (document.activeElement !== document.body) document.activeElement.blur();
          } else {
            this.setState({ openProjectsList: true });
            this.projectListRef.current.focus();
          }
        } else if (e.key === "2") {
          if (openCategoriesList) {
            this.setState({ openCategoriesList: false });
            if (document.activeElement !== document.body) document.activeElement.blur();
          } else {
            this.setState({ openCategoriesList: true });
            this.categoryListRef.current.focus();
          }
        }
      }
    });
  }

  componentDidUpdate() {
    if (this.state.removeProjectConfirmTimeoutEnded) {
      // console.log("timeout on");
    }

    if (JSON.stringify(this.props.projectList) !== JSON.stringify(this.state.projectList)) {
      // console.log("projectList update: ", this.props.projectList);
      this.setState({ projectList: this.props.projectList });
    }

    if (isEmpty(this.state.navbarOpen) && this.props.navbarOpen === true) {
      this.setState({ navbarOpen: true });
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // console.log("nextProps todoData type: ", Array.isArray(nextProps.todoData));

    if (JSON.stringify(nextProps.categoryList) !== JSON.stringify(prevState.categoryList)) {
      return {
        categoryList: nextProps.categoryList,
      };
    }

    if (JSON.stringify(nextProps.projectList) !== JSON.stringify(prevState.projectList)) {
      // console.log("projectList props: ", nextProps.projectList);
      return {
        projectList: nextProps.projectList,
      };
    }

    // console.log("navbar props navbarOpen", nextProps.navbarOpen);
    // console.log("navbar state navbarOpen", prevState.navbarOpen);
    if (isEmpty(prevState.navbarOpen) && nextProps.navbarOpen === true) {
      return {
        navbarOpen: true,
      };
    }
    return null;
  }

  render() {
    const {
      projectText,
      openAddProject,
      projectList,
      removeProjectConfirm,
      openProjectsList,
      removeProjectConfirmTimeoutEnded,
      categoryText,
      openAddCategory,
      categoryList,
      removeCategoryConfirm,
      openCategoriesList,
      removeCategoryConfirmTimeoutEnded,
      navbarOpen,
      newCategoryBtnAnimation,
      projectInputErrorAnim,
      categoryInputErrorAnim,
      uploadCancelled,
      downloadCancelled,
    } = this.state;
    const { currentCategory, currentProject } = this.props;
    const { isAuthenticated } = this.props.auth;
    const { neonTheme } = this.props.styles;

    return (
      <div
        className={classnames("navbarDiv", {
          "navbarDivOpen": navbarOpen,
        })}
      >
        <p className="menuParagraph">Menu</p>

        <div
          className={classnames("navbarOpenBtnDiv", {
            "navbarOpen": navbarOpen,
          })}
          onClick={(e) => {
            if (!isAuthenticated) return;
            if (navbarOpen)
              this.setState({
                navbarOpen: false,
                openProjectsList: false,
                openCategoriesList: false,
                openAddProject: false,
                openAddCategory: false,
                projectInputErrorAnim: false,
                categoryInputErrorAnim: false,
              });
            else this.setState({ navbarOpen: true });
          }}
        >
          <span id="hamburgerTop"></span>
          <span id="hamburgerCenter"></span>
          <span id="hamburgerBottom"></span>
        </div>

        <div
          className="closeNavbarBtn"
          onClick={(e) => {
            if (navbarOpen)
              this.setState({
                navbarOpen: false,
                openProjectsList: false,
                openCategoriesList: false,
                openAddProject: false,
                openAddCategory: false,
                projectInputErrorAnim: false,
                categoryInputErrorAnim: false,
              });
          }}
        ></div>

        <div className="navbarDivWrapper">
          <div className="projectsAndCategories">
            <div className="projectButtonsWrapper">
              <div className="navbarDivInnerProjects">
                <div
                  className={classnames("projectsNavigationDiv", {
                    "addProjectDivActive": openAddProject,
                  })}
                >
                  <div className="addProjectDiv">
                    <div className="addProjectInputDiv">
                      {projectInputErrorAnim ? <p className="projectErrorParagraph">Project exists</p> : null}

                      <div
                        className={classnames("projectInputWrapper", {
                          "projectInputErrorAnim": projectInputErrorAnim,
                        })}
                      >
                        <input
                          autoComplete="off"
                          ref={this.projectInputRef}
                          onKeyDown={(e) => {
                            if (e.ctrlKey && e.keyCode === 13) {
                              var addProjectFunc = this.addProjectShortcut(e, projectText, this.projectInputRef);
                              var mPromise = () => {
                                addProjectFunc
                                  .then((fulfilled) => {
                                    // console.log("result: ", fulfilled);
                                    if (fulfilled === "exists") {
                                      this.setState({ projectInputErrorAnim: true });
                                      return;
                                    } else if (projectInputErrorAnim) this.setState({ projectInputErrorAnim: false });

                                    this.projectListRef.current.selectedIndex = this.projectListRef.current.length - 1;
                                    this.setCurrentProject(this.projectListRef.current.value);
                                    this.categoryInputRef.current.value = "";

                                    setTimeout(() => {
                                      this.setState({ newCategoryBtnAnimation: true });
                                      setTimeout(() => {
                                        this.setState({ openAddCategory: true }, (e) => {
                                          try {
                                            this.categoryInputRef.current.focus();
                                          } catch (err) {}
                                        });
                                      }, 500);
                                    }, 300);
                                  })
                                  .catch((error) => {
                                    // console.log("promise error: ", error);
                                  });
                              };
                              mPromise();
                            }
                          }}
                          type="text"
                          placeholder="Type here"
                          name="projectText"
                          onChange={(e) => {
                            this.setState({ [e.target.name]: e.target.value });
                          }}
                        />
                      </div>

                      <button
                        className={classnames("closeAddProjectBtn navBtn", {
                          "closeAddProjectBtnVisible": openAddProject,
                        })}
                        onClick={(e) => {
                          this.setState({ openAddProject: false });
                        }}
                      >
                        {""}
                      </button>

                      <button
                        className="addProjectBtn navBtn"
                        onClick={(e) => {
                          if (isEmpty(projectText)) return;

                          /*
                                                    I used a promise for the addProject function just to remember another way of accomplishing async/await
                                                */

                          var addProjectFunc = this.addProject(projectText, this.projectInputRef);
                          var mPromise = () => {
                            addProjectFunc
                              .then((fulfilled) => {
                                // console.log("result: ", fulfilled);

                                if (fulfilled === "exists") {
                                  this.setState({ projectInputErrorAnim: true });
                                  return;
                                } else if (projectInputErrorAnim) this.setState({ projectInputErrorAnim: false });

                                this.projectListRef.current.selectedIndex = this.projectListRef.current.length - 1;
                                this.setCurrentProject(this.projectListRef.current.value);

                                this.categoryInputRef.current.value = "";

                                setTimeout(() => {
                                  this.setState({ newCategoryBtnAnimation: true });

                                  setTimeout(() => {
                                    this.setState({ openAddCategory: true }, (e) => {
                                      try {
                                        this.categoryInputRef.current.focus();
                                      } catch (err) {}
                                    });
                                  }, 500);
                                }, 300);
                              })
                              .catch((error) => {
                                // console.log("promise error: ", error);
                              });
                          };
                          mPromise();
                        }}
                      >
                        Add
                      </button>
                    </div>

                    <div className="newProjectBtnDiv">
                      <button
                        className="newProjectBtn navBtn"
                        onClick={(e) => {
                          this.setState({ openAddProject: true });
                          try {
                            this.projectInputRef.current.focus();
                          } catch (err) {}
                        }}
                      >
                        New project
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={classnames("projectsDropdownBtnDiv", {
                  "openProjectsList": openProjectsList && !navbarOpen,
                })}
              >
                {!isEmpty(projectList) ? (
                  <div
                    className="openProjectsBtnDiv"
                    onClick={(e) => {
                      this.setState((prevState) => {
                        return {
                          openProjectsList: !prevState.openProjectsList,
                        };
                      });
                    }}
                  >
                    <p id="projectBtnParagraph">P</p>
                  </div>
                ) : null}

                {!isEmpty(projectList) ? (
                  <select
                    ref={this.projectListRef}
                    className="projectsDropdown"
                    defaultValue={currentProject}
                    onChange={(e) => {
                      this.setCurrentProject(e.target.value);
                    }}
                  >
                    {projectList.map((project, index) => {
                      return <option key={project.id}>{project.name}</option>;
                    })}
                  </select>
                ) : null}
              </div>
              {!isEmpty(projectList) ? (
                <div className="removeProjectDivWrapper">
                  <div className="removeProjectDiv">
                    <p
                      className={classnames("removeProjectConfirmParagraph", {
                        "removeProjectConfirmParagraphShow": removeProjectConfirm,
                        "removeProjectConfirmTimeoutEnded": removeProjectConfirmTimeoutEnded,
                      })}
                      onAnimationEnd={(e) => {
                        if (removeProjectConfirmTimeoutEnded) {
                          this.setState({ removeProjectConfirmTimeoutEnded: false });
                        }
                      }}
                    >
                      Press again to delete
                    </p>
                    <button
                      className={classnames("removeProjectBtn", {
                        "removeProjectBtnConfirm": removeProjectConfirm,
                      })}
                      onClick={(e) => {
                        if (!removeProjectConfirm) {
                          this.setState({ removeProjectConfirm: true }, () => {
                            setTimeout(() => {
                              this.setState({ removeProjectConfirm: false }, (e) => {
                                setTimeout(() => {
                                  // this.setState({ removeProjectConfirmTimeoutEnded: true });
                                }, 1);
                              });
                            }, 3000);
                          });
                        } else {
                          this.setState({ removeProjectConfirm: false });
                          this.removeProject(removeProjectConfirm);
                        }
                      }}
                    >
                      X
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="categoryButtonsWrapper">
              <div className="navbarDivInnerCategories">
                {!isEmpty(projectList) ? (
                  <div
                    className={classnames("categoriesNavigationDiv", {
                      "addCategoryDivActive": openAddCategory,
                    })}
                  >
                    <div className="addCategoryDiv">
                      <div className="addCategoryInputDiv">
                        {categoryInputErrorAnim ? <p className="categoryErrorParagraph">Category exists</p> : null}
                        <span
                          className={classnames("categoryInputWrapper", {
                            "categoryInputErrorAnim": categoryInputErrorAnim,
                          })}
                        >
                          <input
                            autoComplete="off"
                            ref={this.categoryInputRef}
                            onKeyDown={async (e) => {
                              if (e.ctrlKey && e.keyCode === 13) {
                                if (
                                  categoryList
                                    .map((categoryItem) => {
                                      return categoryItem.name;
                                    })
                                    .indexOf(categoryText) !== -1
                                ) {
                                  this.setState({ categoryInputErrorAnim: true });
                                  return;
                                } else if (categoryInputErrorAnim) this.setState({ categoryInputErrorAnim: false });
                                await this.addCategoryShortcut(e, categoryText, this.categoryInputRef);
                                this.categoryListRef.current.selectedIndex = this.categoryListRef.current.length - 1;
                              }
                            }}
                            type="text"
                            placeholder="Type here"
                            name="categoryText"
                            onChange={(e) => {
                              this.setState({ [e.target.name]: e.target.value });
                            }}
                          />
                        </span>

                        <button
                          className={classnames("closeAddCategoryBtn navBtn", {
                            "closeAddCategoryBtnVisible": openAddCategory,
                          })}
                          onClick={(e) => {
                            this.setState({ openAddCategory: false });
                          }}
                        >
                          {""}
                        </button>
                        <button
                          className="addCategoryBtn navBtn"
                          onClick={async (e) => {
                            if (isEmpty(categoryText)) return;

                            if (
                              categoryList
                                .map((categoryItem) => {
                                  return categoryItem.name;
                                })
                                .indexOf(categoryText) !== -1
                            ) {
                              this.setState({ categoryInputErrorAnim: true });
                              return;
                            } else if (categoryInputErrorAnim) this.setState({ categoryInputErrorAnim: false });
                            await this.addCategory(categoryText, this.categoryInputRef);
                            try {
                              // console.log("categorylist", this.categoryListRef.current);
                            } catch (err) {
                              // console.log("categorylist err", err);
                              this.categoryListRef.current.selectedIndex = this.categoryListRef.current.length - 1;
                            }
                          }}
                        >
                          Add
                        </button>
                      </div>
                      <div className="newCategoryBtnDiv">
                        <button
                          className={classnames("newCategoryBtn navBtn", {
                            "newCategoryBtnAnimation": newCategoryBtnAnimation,
                          })}
                          onAnimationEnd={(e) => {
                            this.setState({ newCategoryBtnAnimation: false });
                          }}
                          onClick={(e) => {
                            this.setState({ openAddCategory: true });
                            try {
                              this.categoryInputRef.current.focus();
                            } catch (err) {}
                          }}
                        >
                          New category
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div
                className={classnames("categoriesDropdownBtnDiv", {
                  "openCategoriesList": openCategoriesList && !navbarOpen,
                })}
              >
                {!isEmpty(categoryList) ? (
                  <div
                    className="openCategoriesBtnDiv"
                    onClick={(e) => {
                      this.setState((prevState) => {
                        return {
                          openCategoriesList: !prevState.openCategoriesList,
                        };
                      });
                    }}
                  >
                    <p id="categoryBtnParagraph">C</p>
                  </div>
                ) : null}

                {!isEmpty(categoryList) ? (
                  <select
                    className="categoriesDropdown"
                    ref={this.categoryListRef}
                    defaultValue={currentCategory}
                    onChange={(e) => {
                      this.setCurrentCategory(e.target.value);
                    }}
                  >
                    {categoryList.map((category, index) => {
                      return <option key={category.id}>{category.name}</option>;
                    })}
                  </select>
                ) : null}
              </div>
              {!isEmpty(categoryList) ? (
                <div className="removeCategoryDivWrapper">
                  <div className="removeCategoryDiv">
                    <p
                      className={classnames("removeCategoryConfirmParagraph", {
                        "removeCategoryConfirmParagraphShow": removeCategoryConfirm,
                        "removeCategoryConfirmTimeoutEnded": removeCategoryConfirmTimeoutEnded,
                      })}
                      onAnimationEnd={(e) => {
                        if (removeCategoryConfirmTimeoutEnded) this.setState({ removeCategoryConfirmTimeoutEnded: false });
                      }}
                    >
                      Press again to delete
                    </p>
                    <button
                      className={classnames("removeCategoryBtn", {
                        "removeCategoryBtnConfirm": removeCategoryConfirm,
                      })}
                      onClick={(e) => {
                        if (!removeCategoryConfirm) {
                          this.setState({ removeCategoryConfirm: true }, () => {
                            setTimeout(() => {
                              this.setState({ removeCategoryConfirm: false }, (e) => {
                                setTimeout(() => {
                                  this.setState({ removeCategoryConfirmTimeoutEnded: true });
                                }, 1);
                              });
                            }, 3000);
                          });
                        } else {
                          this.setState({ removeCategoryConfirm: false });
                          this.removeCategory(removeCategoryConfirm);
                        }
                      }}
                    >
                      X
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="exportAndImportBtnsDiv">
            <ToggleButton toggleParameter={neonTheme} description="Neon Theme" toggleFunc={this.props.toggleNeonTheme} />

            <div className="exportAndImportBtnsInnerWrapper">
              {!isEmpty(projectList) ? (
                <button
                  className="exportBtn"
                  onFocus={(e) => {
                    // console.log('focus gained export');
                    if (downloadCancelled) {
                      setTimeout(() => {
                        this.setState({ downloadCancelled: false });
                      }, 500);
                    } else if (!downloadCancelled) {
                      this.setState({ downloadCancelled: true });
                    }
                  }}
                  onClick={(e) => {
                    this.exportData();
                  }}
                >
                  {" "}
                  Export
                </button>
              ) : null}
              <button
                className="importBtn"
                onClick={(e) => {
                  this.importDataBtnRef.current.click();
                }}
                onFocus={(e) => {
                  // console.log("focus gained")
                  if (uploadCancelled) {
                    setTimeout(() => {
                      this.setState({ uploadCancelled: false });
                    }, 500);
                  }
                }}
                onBlur={(e) => {
                  // console.log("focus lost")
                }}
              >
                Import
              </button>
              <input
                className="importBtnInput"
                disabled={!isAuthenticated}
                type="file"
                accept=".json"
                onChange={(e) => {
                  this.importData(e);
                }}
                onClick={(e) => {
                  this.setState({ uploadCancelled: true });
                }}
                ref={this.importDataBtnRef}
              ></input>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    styles: state.styles,
  };
}

export default connect(mapStateToProps, { toggleNeonTheme })(Navbar);