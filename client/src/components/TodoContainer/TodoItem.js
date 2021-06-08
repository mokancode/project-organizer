import React, { Component } from "react";
import "./TodoItem.css";
import isEmpty from "../../validation/is-empty";
import classnames from "classnames";
import PencilIcon from "../SVGs/PencilIcon/PencilIcon";
import SendIcon from "../SVGs/SendIcon/SendIcon";
import CancelIcon from "../SVGs/CancelIcon/CancelIcon";
import TickIcon from "../SVGs/TickIcon/TickIcon";

export class TodoItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      menuTimeoutArray: [],
      timeoutIDs: [],
      editableSubnotes: [],
    };

    this.changeItemCategory = this.props.changeItemCategory;
    this.removeNote = this.props.removeNote;
    this.editNoteWindowFunc = this.props.editNoteWindowFunc;
    this.editNote = this.props.editNote;

    // refs
    this.itemCategorySelectRef = React.createRef();
    this.formRef = React.createRef();
    this.todoItemDivRef = React.createRef();
    this.todoItemButtonsDiv = React.createRef();
    this.textAreaRef = React.createRef();
    this.subnotesListRef = React.createRef();
  }

  componentDidMount() {
    // console.log("scroll height: ", this.todoItemDivRef.current.scrollHeight);

    this.setState({ noteText: this.props.text });

    if (this.todoItemDivRef.current.scrollHeight >= 130) {
      this.setState({ todoItemDivHigh: true });
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (JSON.stringify(nextProps.currentCategory) !== JSON.stringify(prevState.currentCategory)) {
      // console.log("updated todoItem category", nextProps);
      return {
        currentCategory: nextProps.currentCategory,
        categoryList: nextProps.categoryList,
        subnotes: nextProps.subnotes,
        editableSubnotes: !isEmpty(nextProps.subnotes) ? JSON.parse(JSON.stringify(nextProps.subnotes)) : [],
      };
    }

    if (!isEmpty(nextProps.subnotes) && JSON.stringify(nextProps.subnotes) !== JSON.stringify(prevState.subnotes)) {
      return {
        subnotes: nextProps.subnotes,
        editableSubnotes: !isEmpty(nextProps.subnotes) ? JSON.parse(JSON.stringify(nextProps.subnotes)) : [],
      };
    }

    return null;
  }

  componentDidUpdate() {
    const { todoItemDivHigh } = this.state;
    if (this.todoItemDivRef.current.scrollHeight >= 130 && !todoItemDivHigh) this.setState({ todoItemDivHigh: true });
    else if (this.todoItemDivRef.current.scrollHeight < 130 && todoItemDivHigh) this.setState({ todoItemDivHigh: false });

    if (JSON.stringify(this.props.subnotes) !== JSON.stringify(this.state.subnotes)) {
      this.setState({
        subnotes: this.props.subnotes,
        editableSubnotes: !isEmpty(this.props.subnotes) ? JSON.parse(JSON.stringify(this.props.subnotes)) : [],
      });
    }
  }

  render() {
    const { text, noteId, itemIndex } = this.props;
    const {
      categoryList,
      currentCategory,
      openChangeItemCategoryMenu,
      removeNoteConfirm,
      todoItemDivHigh,
      revealTodoItemButtonsDiv,
      todoItemButtonsDivInPosition,
      internalEditingMode,
      noteText,
    } = this.state;
    var { subnotes, editableSubnotes, timeoutIDs } = this.state;

    return (
      <div
        className={classnames("todoItemDiv", {
          todoItemDiv2: itemIndex % 2 === 0,
          todoItemDivHigh: todoItemDivHigh,
        })}
        ref={this.todoItemDivRef}
      >
        <div className="todoItemTextDivWrapper">
          {internalEditingMode ? (
            <textarea
              ref={this.textAreaRef}
              className="internalEditingField"
              defaultValue={text}
              onChange={(e) => {
                this.setState({ noteText: e.target.value });
              }}
              onKeyDown={async (e) => {
                if (e.ctrlKey && e.keyCode === 13) {
                  this.setState({ internalEditingMode: false });
                  if (noteText === text && JSON.stringify(subnotes) === JSON.stringify(editableSubnotes)) return;
                  await this.editNote(noteId, noteText, editableSubnotes);
                } else if (e.keyCode === 27) {
                  this.setState({ internalEditingMode: false });
                }
              }}
            ></textarea>
          ) : (
            text.split("\n").map((line, index) => {
              return (
                <div
                  className="todoItemTextDiv"
                  key={noteId + "_noteText" + index}
                  onDoubleClick={(e) => {
                    this.setState({ internalEditingMode: true }, () => {
                      this.textAreaRef.current.focus();
                    });
                  }}
                >
                  <p className="todoItemText">{line}</p>
                  <p className="newLine"></p>
                </div>
              );
            })
          )}
          {!isEmpty(subnotes) ? (
            <ol className="subnotesList" ref={this.subnotesListRef}>
              {subnotes.map((subNote, index) => {
                return (
                  <li
                    key={subNote.id}
                    className={classnames("", {
                      editingMode: internalEditingMode,
                    })}
                    onDoubleClick={(e) => {
                      this.setState({ internalEditingMode: true }, () => {
                        this.subnotesListRef.current.childNodes[index].childNodes[1].focus();
                      });
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={subNote.checked}
                      onChange={(e) => {
                        var editedSubnote = subNote;
                        editedSubnote.checked = e.target.checked;

                        subnotes.map((currentSubnote, newIndex) => {
                          return currentSubnote.id === editedSubnote.id ? currentSubnote : subNote;
                        });

                        this.editNote(noteId, text, editableSubnotes);
                      }}
                    ></input>
                    {internalEditingMode ? (
                      <input
                        className="internalEditingField"
                        defaultValue={subNote.text}
                        onChange={(e) => {
                          editableSubnotes.filter((item) => item.id === subNote.id)[0].text = e.target.value;
                        }}
                        onKeyDown={async (e) => {
                          if (e.ctrlKey && e.keyCode === 13) {
                            this.setState({ internalEditingMode: false });
                            if (noteText === text && JSON.stringify(subnotes) === JSON.stringify(editableSubnotes)) return;
                            await this.editNote(noteId, noteText, editableSubnotes);
                          } else if (e.keyCode === 27) {
                            this.setState({ internalEditingMode: false });
                          }
                        }}
                      ></input>
                    ) : (
                      <p>{subNote.text}</p>
                    )}
                  </li>
                );
              })}
            </ol>
          ) : null}
        </div>

        <div
          className={classnames("todoItemButtonsWrapper", {
            "revealButtons": revealTodoItemButtonsDiv,
            "inPosition": todoItemButtonsDivInPosition,
          })}
          onMouseEnter={() => {
            // console.log("onEnter", isEmpty(timeoutIDs));
            while (!isEmpty(timeoutIDs)) {
              window.clearTimeout(timeoutIDs.pop());
            }
            this.setState({ timeoutIDs });
          }}
          onMouseLeave={() => {
            if (isEmpty(timeoutIDs)) {
              var timeoutId = setTimeout(() => {
                this.setState({ revealTodoItemButtonsDiv: false, todoItemButtonsDivInPosition: false });
              }, 1000);
              timeoutIDs.push(timeoutId);
              this.setState({ timeoutIDs });
            }
          }}
        >
          <div
            id="revealTodoItemButtonsDivBtn"
            onMouseEnter={() => {
              setTimeout(() => {
                this.setState({ revealTodoItemButtonsDiv: true });
              }, 200);
            }}
            // onClick={() => {
            // }}
          >
            <div></div>
            <div></div>
            <div></div>
          </div>

          <div className="todoItemButtonsInnerWrapper">
            <div
              className="todoItemButtonsDiv"
              ref={this.todoItemButtonsDiv}
              onTransitionEnd={(e) => {
                if (this.todoItemButtonsDiv.current === e.target && revealTodoItemButtonsDiv) {
                  this.setState({ todoItemButtonsDivInPosition: true });
                }

                // if (this.todoItemButtonsDiv.current === e.target && todoItemButtonsDivInPosition) {
                //     console.log("hiding todo item buttons");
                //     this.setState({ revealTodoItemButtonsDiv: false, todoItemButtonsDivInPosition: false });
                // }
              }}
            >
              <div className="openChangeItemCategoryDiv">
                <div
                  className={classnames("openChangeItemCategoryBtn", {
                    openChangeItemCategoryBtnActivated: openChangeItemCategoryMenu,
                  })}
                  onMouseEnter={(e) => {
                    // console.log("mouse enter");
                    var { menuTimeoutArray } = this.state;
                    for (var i = 0; i < menuTimeoutArray.length; i++) {
                      clearTimeout(menuTimeoutArray[i]);
                    }
                    this.setState({ openChangeItemCategoryMenu: true });
                  }}
                  onMouseLeave={(e) => {
                    var { menuTimeoutArray } = this.state;
                    var menuTimeoutId = setTimeout(() => {
                      this.setState({ openChangeItemCategoryMenu: false, menuTimeoutArray: [] });
                    }, 1000);
                    menuTimeoutArray.push(menuTimeoutId);
                    this.setState({ menuTimeoutArray });
                  }}
                  onClick={(e) => {
                    const { menuTimeoutArray } = this.state;
                    if (!isEmpty(menuTimeoutArray))
                      this.setState((prevState) => {
                        return {
                          openChangeItemCategoryMenu: !prevState.openChangeItemCategoryMenu,
                        };
                      });
                  }}
                >
                  <SendIcon />
                </div>

                {/* <button
                            className={classnames("openChangeItemCategoryBtn", {
                                "openChangeItemCategoryBtnActivated": openChangeItemCategoryMenu
                            })}
                            onMouseEnter={(e) =>{
                                console.log("mouse enter");
                                var { menuTimeoutArray } = this.state;
                                for (var i = 0; i < menuTimeoutArray.length; i++) {
                                    clearTimeout(menuTimeoutArray[i]);
                                }
                                this.setState({ openChangeItemCategoryMenu: true })
                            }}

                            onMouseLeave={(e) =>{
                                var { menuTimeoutArray } = this.state;
                                var menuTimeoutId = setTimeout(() =>{
                                    this.setState({ openChangeItemCategoryMenu: false, menuTimeoutArray: [] });
                                }, 1000);
                                menuTimeoutArray.push(menuTimeoutId);
                                this.setState({ menuTimeoutArray });
                            }}

                            onClick={(e) =>{
                                const { menuTimeoutArray } = this.state;
                                if (!isEmpty(menuTimeoutArray))
                                    this.setState((prevState) =>{
                                        return {
                                            openChangeItemCategoryMenu: !prevState.openChangeItemCategoryMenu
                                        }
                                    })
                            }}>O
                    </button> */}
                {!isEmpty(categoryList) && !isEmpty(currentCategory) ? (
                  <div
                    className={classnames("categoriesDropdownTodoItemDiv", {
                      categoriesDropdownTodoItemDivVisible: openChangeItemCategoryMenu,
                    })}
                    onMouseEnter={(e) => {
                      var { menuTimeoutArray } = this.state;
                      for (var i = 0; i < menuTimeoutArray.length; i++) {
                        clearTimeout(menuTimeoutArray[i]);
                      }
                      this.setState({ openChangeItemCategoryMenu: true });
                    }}
                    onMouseLeave={(e) => {
                      var { menuTimeoutArray } = this.state;
                      var menuTimeoutId = setTimeout(() => {
                        this.setState({ openChangeItemCategoryMenu: false, menuTimeoutArray: [] });
                      }, 1000);
                      menuTimeoutArray.push(menuTimeoutId);
                      this.setState({ menuTimeoutArray });
                    }}
                  >
                    <ul className="changeCategoryList">
                      {categoryList
                        .filter((categoryItem) => {
                          return categoryItem.name !== currentCategory.name;
                        })
                        .map((item, index) => {
                          return (
                            <li
                              key={noteId + "_changeCategoryBtnLi" + index}
                              className="changeCategoryBtnLi"
                              onClick={(e) => {
                                this.changeItemCategory(
                                  item.id,
                                  Object.assign({
                                    id: noteId,
                                    text,
                                    subnotes,
                                  })
                                );
                              }}
                            >
                              <p>{item.name}</p>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                ) : null}
              </div>

              <div
                className="editNoteBtnDiv"
                onClick={(e) => {
                  try {
                    var originalSubNotesList;
                    if (isEmpty(subnotes)) originalSubNotesList = [];
                    else originalSubNotesList = Object.assign([], JSON.parse(JSON.stringify(subnotes)));
                    this.editNoteWindowFunc(true, { text, subnotes, noteId }, originalSubNotesList);
                  } catch (err) {
                    // console.log("err: ", err);
                  }
                }}
              >
                <PencilIcon />
              </div>

              <div className="removeNoteDiv">
                <p
                  className={classnames("confirmDeleteParagraph", {
                    confirmDeleteParagraphVisible: removeNoteConfirm,
                  })}
                >
                  Press again to delete
                </p>
                <div
                  className="todoItemRemoveBtn"
                  onClick={(e) => {
                    if (!removeNoteConfirm) {
                      this.setState({ removeNoteConfirm: true }, () => {
                        setTimeout(() => {
                          this.setState({ removeNoteConfirm: false });
                        }, 3000);
                      });
                    } else if (removeNoteConfirm) {
                      this.setState({ removeNoteConfirm: false });
                      this.removeNote(noteId);
                    }
                  }}
                >
                  <CancelIcon />
                </div>
                {/* <button className={classnames("removeNoteBtn", {
                            "removeNoteBtnConfirm": removeNoteConfirm
                        })}
                            onClick={(e) =>{
                                if (!removeNoteConfirm) {
                                    this.setState({ removeNoteConfirm: true }, () =>{
                                        setTimeout(() =>{
                                            this.setState({ removeNoteConfirm: false });
                                        }, 3000);
                                    });
                                }
                                else if (removeNoteConfirm) {
                                    this.setState({ removeNoteConfirm: false });
                                    this.removeNote(noteId);
                                }
                            }}
                        >X</button> */}
              </div>
            </div>
          </div>
        </div>

        <span className="styleBorder"></span>

        {internalEditingMode && (
          <div id="submitInternalEditingBtnWrapper">
            <div
              id="submitInternalEditingBtnInnerWrapper"
              onClick={async () => {
                this.setState({ internalEditingMode: false });

                if (noteText === text && JSON.stringify(subnotes) === JSON.stringify(editableSubnotes)) return;

                await this.editNote(noteId, noteText, editableSubnotes);
              }}
            >
              <TickIcon isClickable={true} />
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default TodoItem;
