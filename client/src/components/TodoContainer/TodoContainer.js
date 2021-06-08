import React, { Component } from "react";
import "./TodoContainer.css";
import TodoItem from "./TodoItem";
import isEmpty from "../../validation/is-empty";
import classnames from "classnames";
import EditNote from "./EditNote";
import shortid from "shortid";
import PencilIcon from "../SVGs/PencilIcon/PencilIcon";
import TodoSubNoteItem from "./TodoSubNoteItem";
import offset from "document-offset";
import TickIcon from "../SVGs/TickIcon/TickIcon";
import CancelIcon from "../SVGs/CancelIcon/CancelIcon";
import { connect } from "react-redux";
import TitleUnderline from "../SVGs/TitleUnderline/TitleUnderline";
import { toggleNeonTheme } from "../../actions/styleActions";

export class TodoContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      todoData: {},
      todoList: {},
      currentCategory: {},
      currentProject: {},
      subNoteList: [],
      editNoteWindow: false,
    };

    this.changeItemCategory = this.props.changeItemCategory;
    this.addNote = this.props.addNote;
    this.editNote = this.props.editNote;
    this.addNoteShortcut = this.props.addNoteShortcut;
    this.removeNote = this.props.removeNote;
    this.editProjectName = this.props.editProjectName;
    this.openNavbarMenu = this.props.openNavbarMenu;

    // refs
    this.todoContainerRef = React.createRef();
    this.textAreaRef = React.createRef();
    this.subnoteInputRef = React.createRef();
    this.todoListRef = React.createRef();
    this.subNoteListRef = React.createRef();
    this.mainAddNoteBtnRef = React.createRef();
    this.editProjectNameInputRef = React.createRef();
    this.categoryNameRef = React.createRef();
  }

  updateList(todoData, currentProject, currentCategory) {
    if (todoData === "cleared") {
      return this.setState({ todoData: {}, todoList: {}, currentCategory: {}, currentProject: {}, subNoteList: [] });
    }

    var newTodoList = {};
    newTodoList.uid = todoData.uid;

    // console.log("updateList current categ", currentCategory);

    newTodoList.currentProject = JSON.parse(JSON.stringify(currentProject));
    newTodoList.currentCategory = JSON.parse(JSON.stringify(currentCategory));

    newTodoList.notes = todoData.list
      .filter((projectItem) => {
        return projectItem.id === currentProject.id;
      })[0]
      .categories.filter((categoryItem) => {
        return categoryItem.id === currentCategory.id;
      })[0].notes;

    this.setState({ todoList: newTodoList });
  }

  componentDidUpdate() {
    const { todoData, currentProject, currentCategory, todoList } = this.state;

    // console.log("update", todoData);

    if (!isEmpty(todoData.list) && todoData !== "cleared" && !isEmpty(currentProject) && !isEmpty(currentCategory)) {
      //   console.log("todoData didUpdate");

      // console.log("conditions", !isEmpty(todoList), todoList.currentProject.id, this.state.currentProject.id);

      if (isEmpty(todoList) || todoData.uid !== todoList.uid) {
        // console.log("todoData updating");
        this.updateList(todoData, currentProject, currentCategory);
      } else if (!isEmpty(todoList) && todoList.currentProject.id !== this.state.currentProject.id) {
        // console.log("diff projs");
        this.updateList(todoData, currentProject, currentCategory);
      } else if (!isEmpty(todoList) && todoList.currentCategory.id !== this.state.currentCategory.id) {
        // console.log("diff categ");
        this.updateList(todoData, currentProject, currentCategory);
      }
    } else if ((todoData === "cleared" || isEmpty(currentCategory)) && !isEmpty(todoList)) {
      this.updateList("cleared");
    }

    if (this.categoryNameRef.current && this.categoryNameRef.current.offsetWidth !== this.state.categoryNameWidth) {
      this.setState({ categoryNameWidth: this.categoryNameRef.current.offsetWidth });
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    try {
      if (!isEmpty(nextProps.todoData)) {
        if (isEmpty(prevState.todoData) || nextProps.todoData.uid !== prevState.todoData.uid) {
          // console.log("updated todo");
          return {
            todoData: nextProps.todoData,
          };
        }
      }
      if (!isEmpty(nextProps.currentProject) && nextProps.currentProject.id !== prevState.currentProject.id) {
        // console.log(
        //   "updated proj and categ \n",
        //   nextProps.currentProject,
        //   "\n",
        //   prevState.currentProject,
        //   "\n",
        //   nextProps.currentCategory,
        //   "\n",
        //   prevState.currentCategory
        // );
        return {
          currentProject: JSON.parse(JSON.stringify(nextProps.currentProject)),
          currentCategory: JSON.parse(JSON.stringify(nextProps.currentCategory)),
        };
      }

      if (!isEmpty(nextProps.currentCategory) && JSON.stringify(nextProps.currentCategory) !== JSON.stringify(prevState.currentCategory)) {
        // console.log("updated categ");
        return {
          currentCategory: JSON.parse(JSON.stringify(nextProps.currentCategory)),
        };
      } else if (isEmpty(nextProps.currentCategory) && !isEmpty(prevState.currentCategory)) {
        // console.log("emptied categ");
        return {
          currentCategory: {},
          todoList: {},
        };
      }
    } catch (err) {
      console.log("err", err);
    }
    return null;
  }

  editNoteWindowFunc = (state, editableNoteObject, originalSubnotes) => {
    // console.log("editablenoteobj: ", editableNoteObject);
    if (state === false) this.setState({ editNoteWindow: false, editableNoteObject: null });
    else this.setState({ editNoteWindow: true, editableNoteObject, originalSubnotes });
  };

  async editSubNote(editedSubNote) {
    // console.log("edit sub note", editedSubNote);

    var { subNoteList } = this.state;

    subNoteList = subNoteList.map((subNoteItem) => {
      if (subNoteItem.id === editedSubNote.id) {
        subNoteItem = editedSubNote;
      }
      return subNoteItem;
    });

    await this.setState({ subNoteList });
    // console.log('current subnote list', subNoteList);
    // console.log('param subNote', subNote);
  }

  render() {
    const { todoList, noteText, subNoteText, subNoteList, editNoteWindow, projectNameEditEnabled, editedProjectName, subNoteTextNotEmpty } =
      this.state;
    const { currentCategory, currentProject, todoData, categoryList } = this.props;
    const { isAuthenticated } = this.props.auth;
    const { neonTheme } = this.props.styles;

    // return null;

    return (
      <div
        className={classnames("todoContainer", {
          todoContainerNeon: neonTheme && neonTheme.isOn,
        })}
        ref={this.todoContainerRef}
        onTransitionEnd={(e) => {
          if (this.todoContainerRef.current === e.target) {
            // console.log("todocontainer transition end");
            var { neonTheme } = this.props.styles;
            if (neonTheme.isOn) neonTheme.animEnded = true;
            else if (neonTheme.isOn === false) neonTheme.animEnded = true;
            this.props.toggleNeonTheme(neonTheme);
          }
        }}
      >
        {isEmpty(currentCategory) ? (
          <div className="borderBoxWrapper">
            <div
              onClick={async (e) => {
                if (isAuthenticated) {
                  await this.openNavbarMenu(true);
                  await this.openNavbarMenu(false);
                } else {
                }
              }}
              className="borderBox"
            >
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <div className="borderBoxContent">
                {isAuthenticated ? <h1>You have no notes yet!</h1> : <h1>Log in to begin</h1>}

                {isEmpty(currentProject) ? (
                  isAuthenticated ? (
                    <p>Click here to open the menu</p>
                  ) : null
                ) : //         // <p>{`Click here to ${isAuthenticated ? "open the menu" : "login"}`}</p>

                !isEmpty(currentProject) && isEmpty(currentCategory) ? (
                  <div>
                    <p>
                      Project <span>{`${currentProject.name}`}</span> has been created. Now create a category
                    </p>
                    <p id="egCategories">(e.g. To-do, Completed, Cancelled, Postponed, etc.)</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {!isEmpty(currentProject) && !isEmpty(currentProject.name) && isAuthenticated ? (
          <div className="editProjectNameDiv">
            {!projectNameEditEnabled ? (
              <div className="editProjectNameDivInner">
                <h1 className="projectName">{currentProject.name}</h1>

                <div
                  className="editProjectNameBtnDiv editSubNoteBtnDiv"
                  onClick={async (e) => {
                    await this.setState({ projectNameEditEnabled: true });
                    this.editProjectNameInputRef.current.focus();
                    // this.setState({ editNoteEnabled: true, textAreaColsUpdated: false }, (e) =>{
                    //     this.editSubNoteRef.current.focus();
                    //     var temp_value = this.editSubNoteRef.current.value;
                    //     this.editSubNoteRef.current.value = '';
                    //     this.editSubNoteRef.current.value = temp_value;
                    // });
                  }}
                >
                  <PencilIcon />
                </div>
              </div>
            ) : (
              <div className="editProjectNameInputDiv">
                <input
                  maxLength={50}
                  ref={this.editProjectNameInputRef}
                  defaultValue={currentProject.name}
                  type="text"
                  onChange={(e) => {
                    this.setState({ editedProjectName: e.target.value });
                  }}
                ></input>

                <div
                  className="confrimEditProjectNameBtn"
                  onClick={async () => {
                    if (isEmpty(editedProjectName) || editedProjectName === currentProject.name) return;
                    this.setState({ projectNameEditEnabled: false });
                    this.editProjectName(editedProjectName);
                  }}
                >
                  <TickIcon
                    isClickable={String(editedProjectName).localeCompare(currentProject.name) !== 0 && !isEmpty(editedProjectName)}
                  />
                </div>
                <div
                  className="cancelEditProjectNameBtn"
                  onClick={() => {
                    this.setState({ projectNameEditEnabled: false });
                  }}
                >
                  <CancelIcon />
                </div>
              </div>
            )}
          </div>
        ) : null}
        {!isEmpty(currentCategory) && !isEmpty(currentCategory.name) && isAuthenticated ? (
          <div className="categoryNameWrapper">
            <h1 className="categoryName" ref={this.categoryNameRef}>
              {currentCategory.name}
            </h1>
            {this.categoryNameRef && this.categoryNameRef.current ? <TitleUnderline mWidth={this.state.categoryNameWidth} /> : null}
          </div>
        ) : null}

        {todoList !== null && todoList !== "empty" && isAuthenticated ? (
          <div className="todoListDivWrapper">
            <ul className="todoListDiv" ref={this.todoListRef}>
              {!isEmpty(todoList.notes) &&
                todoList.notes.map((noteItem, index) => {
                  return (
                    <li
                      className={classnames("todoItemLi", {
                        todoItemLi2: index % 2 === 0,
                      })}
                      key={noteItem.id}
                    >
                      <TodoItem
                        noteId={noteItem.id}
                        todoData={todoData.list}
                        text={noteItem.text}
                        subnotes={noteItem.subnotes}
                        itemIndex={index}
                        currentCategory={currentCategory}
                        changeItemCategory={this.changeItemCategory}
                        categoryList={categoryList}
                        removeNote={this.removeNote}
                        editNoteWindowFunc={this.editNoteWindowFunc}
                        editNote={this.editNote}
                      />
                    </li>
                  );
                })}
            </ul>
          </div>
        ) : null}

        {!isEmpty(categoryList) && isAuthenticated ? (
          <div
            className={classnames("addNoteDiv", {
              addNoteDivNeon: neonTheme.isOn,
            })}
            // onBlur={async (e) => {
            //   return;
            //   setTimeout(async () => {
            //     const activeElement = document.activeElement;
            //     if (activeElement !== this.textAreaRef.current && activeElement !== this.subnoteInputRef.current) {
            //       const { noteText } = this.state;
            //       try {
            //         if (isEmpty(noteText)) return;
            //         else if (!isEmpty(subNoteText) || !isEmpty(this.subNoteInputRef.current.value)) {
            //           this.setState({ subNoteTextNotEmpty: true });
            //           return;
            //         }
            //       } catch (err) {}
            //       await this.addNote({ text: noteText, subnotes: subNoteList }, this.textAreaRef);
            //       this.setState({ noteText: "", subNoteList: [] });

            //       var element = this.todoListRef.current.childNodes[this.todoListRef.current.childNodes.length - 1];

            //       window.scroll({
            //         behavior: "smooth",
            //         left: 0,
            //         // top: document.documentElement.scrollHeight
            //         top: element.offsetTop,
            //       });
            //     }
            //   }, 100);
            // }}
          >
            <textarea
              autoComplete={"off"}
              ref={this.textAreaRef}
              onKeyDown={async (e) => {
                if (e.ctrlKey && e.keyCode === 13) {
                  try {
                    // var addNoteFunc = this.addNoteShortcut(e, noteText, this.textAreaRef);
                    // var mPromise = () =>{
                    //     addNoteFunc
                    //         .then((fulfilled) =>{
                    //             // console.log("promise: ", fulfilled);
                    //             if (fulfilled === "removed") {
                    //                 this.setState({ noteText: "" })
                    //             }
                    //         })z
                    //         .catch((err) { }=>)
                    // };
                    // mPromise();

                    if (isEmpty(noteText)) return;
                    else if (!isEmpty(subNoteText) || !isEmpty(this.subNoteInputRef.current.value)) {
                      subNoteList.push({ text: subNoteText, id: shortid.generate() });
                      this.setState({ subNoteList, subNoteText: "" }, (e) => {
                        this.subnoteInputRef.current.value = "";
                      });
                    }

                    await this.addNoteShortcut(e, { text: noteText, subnotes: subNoteList }, this.textAreaRef);
                    this.setState({ noteText: "", subNoteList: [] });

                    // console.log("this.todoListRef", this.todoListRef.current);
                    var element = this.todoListRef.current.childNodes[this.todoListRef.current.childNodes.length - 1];

                    // console.log("elt: ", element);

                    window.scroll({
                      behavior: "smooth",
                      left: 0,
                      // top: document.documentElement.scrollHeight
                      top: element.offsetTop,
                    });
                  } catch (err) {
                    // console.log("err: ", err);
                  }
                }
              }}
              onChange={(e) => {
                this.setState({ [e.target.name]: e.target.value });
              }}
              name="noteText"
              type="text"
              placeholder="Type a new note here"
            ></textarea>
            {!isEmpty(noteText) ? (
              <div className="addSubNoteWrapperDiv">
                {!isEmpty(subNoteList) ? (
                  <ol ref={this.subNoteListRef}>
                    {subNoteList.map((subNote, index) => {
                      return (
                        <li key={subNote.id}>
                          <TodoSubNoteItem subNote={subNote} editSubNote={this.editSubNote} />
                        </li>
                      );
                    })}
                  </ol>
                ) : null}
                <div
                  className="addSubNoteDiv"
                  onFocus={(e) => {
                    // console.log("subnote activeElement", e.target);
                  }}
                >
                  <input
                    placeholder={"Type a new subnote here"}
                    type="text"
                    name="subNoteText"
                    ref={this.subnoteInputRef}
                    onChange={(e) => {
                      this.setState({ [e.target.name]: e.target.value });
                    }}
                    autoComplete={"off"}
                    className={classnames(
                      {},
                      {
                        subNoteTextNotEmpty: subNoteTextNotEmpty,
                      }
                    )}
                    onAnimationEnd={() => {
                      if (subNoteTextNotEmpty) this.setState({ subNoteTextNotEmpty: false });
                    }}
                    onKeyDown={async (e) => {
                      if (e.ctrlKey && e.keyCode === 13) {
                        if (isEmpty(subNoteText)) return;
                        subNoteList.push({ text: subNoteText, id: shortid.generate() });
                        await this.setState({ subNoteList, subNoteText: "" }, () => {
                          this.subnoteInputRef.current.value = "";
                        });

                        // var element = this.subNoteListRef.current.childNodes[this.subNoteListRef.current.childNodes.length - 1];
                        var element = this.mainAddNoteBtnRef.current;
                        // console.log("element shortcut: ", element);

                        window.scroll({
                          behavior: "smooth",
                          left: 0,
                          top: offset(element).top,
                        });
                      }
                    }}
                  ></input>
                  <button
                    onClick={async (e) => {
                      if (isEmpty(subNoteText)) return;
                      subNoteList.push({ text: subNoteText, id: shortid.generate() });
                      await this.setState({ subNoteList, subNoteText: "" }, () => {
                        this.subnoteInputRef.current.value = "";
                      });

                      // var element = this.subNoteListRef.current.childNodes[this.subNoteListRef.current.childNodes.length - 1];
                      var element = this.mainAddNoteBtnRef.current;

                      window.scroll({
                        behavior: "smooth",
                        // left: 0,
                        // top: element.offsetTop + 100
                        top: offset(element).top,
                      });
                    }}
                    className="addSubNoteBtn addNoteBtn"
                  >
                    +
                  </button>
                </div>
              </div>
            ) : null}
            <button
              onClick={async (e) => {
                const { noteText } = this.state;
                try {
                  if (isEmpty(noteText)) return;
                  else if (!isEmpty(subNoteText) || !isEmpty(this.subNoteInputRef.current.value)) {
                    // this.setState({ subNoteTextNotEmpty: true });
                    // return;

                    subNoteList.push({ text: subNoteText, id: shortid.generate() });
                    this.setState({ subNoteList, subNoteText: "" }, (e) => {
                      this.subnoteInputRef.current.value = "";
                    });
                  }
                } catch (err) {}
                await this.addNote({ text: noteText, subnotes: subNoteList }, this.textAreaRef);
                this.setState({ noteText: "", subNoteList: [] });

                var element = this.todoListRef.current.childNodes[this.todoListRef.current.childNodes.length - 1];

                window.scroll({
                  behavior: "smooth",
                  left: 0,
                  // top: document.documentElement.scrollHeight
                  top: element.offsetTop,
                });
              }}
              id="mainAddNoteBtn"
              className="addNoteBtn"
              ref={this.mainAddNoteBtnRef}
            >
              +
            </button>
          </div>
        ) : null}

        {editNoteWindow ? (
          <EditNote
            editNoteWindowFunc={this.editNoteWindowFunc}
            editNote={this.editNote}
            addNoteShortcut={this.addNoteShortcut}
            editableNoteObject={this.state.editableNoteObject}
            originalSubNoteList={this.state.originalSubnotes}
          />
        ) : null}
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

export default connect(mapStateToProps, { toggleNeonTheme })(TodoContainer);
// export default TodoContainer;
