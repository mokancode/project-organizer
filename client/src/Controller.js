import React, { Component } from "react";
import "./App.css";
import TodoContainer from "./components/TodoContainer/TodoContainer";
import Navbar from "./components/Navbar/Navbar";
import shortid from "shortid";
import { updateNotes, uploadNotes, setLastNotes, setServerResponseMsg, setNotesOrigin, clearState } from "./actions/authActions";
import { v4 as generateUniqueID } from "uuid";
import { connect } from "react-redux";
import axios from "axios";
import isEmpty from "./validation/is-empty";

class Controller extends Component {
  constructor(props) {
    super(props);

    this.state = {
      todoData: {},
      categoryList: [],
      projectList: [],
    };
  }

  componentDidMount() {
    const { user, isAuthenticated } = this.props.auth;
    if (isAuthenticated && !isEmpty(user)) {
      axios
        .get(`/api/users/getnotes/${user.id}`)
        .then((res) => {
          // this.setState({ serverResponse: res.data, isLoading: false });
          // console.log("getnotes res: ", res.data);
          if (!isEmpty(res.data) && typeof res.data === "object") {
            // console.log("res.data", res.data);
            var parsedData = { list: res.data, uid: generateUniqueID() };
            // console.log("parsed", JSON.parse(JSON.stringify(parsedData)));

            this.props.updateNotes(parsedData);
            this.props.setLastNotes(parsedData);
            this.loadData(parsedData);
            this.props.setServerResponseMsg("Notes loaded");
          } else if (isEmpty(res.data)) {
            // this.props.setServerResponseMsg("Server error (Refresh the page or try to log off and on)");
            // console.log("getnotes res.data is empty");
          } else throw new Error("Error fetching notes");
        })
        .catch((error) => {
          // console.log("getnotes err: ", error);
          // console.log("getnotes err: ", error.response.data);
          try {
            var { errors } = error.response.data;
            if (!isEmpty(errors) && !isEmpty(errors.getnotes)) {
              // console.log("getnotes setting server response");
              this.props.setServerResponseMsg(errors.getnotes);
            } else {
              // console.log("getnotes error");
              this.props.setServerResponseMsg("Server error (Refresh the page or try to log off and on)");
            }
          } catch (err) {
            this.props.setServerResponseMsg("Server error (Refresh the page or try to log off and on)");
            // console.log("getnotes some type of err: ", err);
          }
        });

      // if (!isEmpty(data)) {
      //   // console.log("local storage todoData exists", data);
      //   this.props.updateNotes(data);
      //   this.loadData(data);
      //   // return;
      // }
    }
  }

  componentDidUpdate() {
    const { todoData, currentProject, currentCategory, categoryList, projectList, loadedNotesFromWeb } = this.state;
    const { isAuthenticated } = this.props.auth;
    // console.log("isAuth: ", isAuthenticated, todoData)
    if (
      (!isEmpty(todoData.list) ||
        !isEmpty(currentProject) ||
        !isEmpty(currentCategory) ||
        !isEmpty(categoryList) ||
        !isEmpty(projectList)) &&
      !isAuthenticated
    ) {
      // console.log("clearing state");
      this.props.updateNotes(null);
      this.props.setLastNotes(null);

      todoData.uid = generateUniqueID();
      this.setState({
        todoData: {},
        currentProject: null,
        currentCategory: null,
        categoryList: [],
        projectList: [],
        loadedNotesFromWeb: false,
      });
    }

    if (isEmpty(todoData.list) && loadedNotesFromWeb) {
      this.setState({ loadedNotesFromWeb: false });
    }

    if (this.props.auth.clearNotes) {
      this.props.updateNotes(null);
      this.props.setLastNotes(null);
      this.props.setNotesOrigin(null);

      // todoData.uid = generateUniqueID();
      this.setState(
        {
          todoData: "cleared",
          currentProject: null,
          currentCategory: null,
          categoryList: [],
          projectList: [],
          loadedNotesFromWeb: false,
        },
        () => {
          this.props.clearState(false);
        }
      );
      // console.log("clearing state 2");
    }

    const notesFromRedux = this.props.auth.notes;
    if (isAuthenticated) {
      const { lastNotes, notesOrigin } = this.props.auth;
      const { loadedNotesFromWeb } = this.state;
      if (!isEmpty(notesFromRedux) && isEmpty(todoData.list) && !isEmpty(lastNotes) && notesOrigin === "login" && !loadedNotesFromWeb) {
        // console.log("from redux", notesFromRedux, todoData, notesOrigin, loadedNotesFromWeb);
        this.setState({ loadedNotesFromWeb: true });
        this.loadData(notesFromRedux);
        this.props.setNotesOrigin(null);
      }
    }
  }

  addNoteShortcut = async (e, noteObject, textAreaRef) => {
    return await this.addNote(noteObject, textAreaRef);
  };

  addNote = async (noteObject, textAreaRef) => {
    const { isAuthenticated } = this.props.auth;
    if (!isAuthenticated) return;

    console.log("noteObject: ", noteObject);
    // console.log("isEmpty? noteObject: ", isEmpty(noteObject));
    if (isEmpty(noteObject.text)) return;
    var { todoData, currentCategory, currentProject } = this.state;
    todoData.list = todoData.list.map((projectItem) => {
      if (projectItem.id === currentProject.id) {
        projectItem.categories = projectItem.categories.map((categoryItem) => {
          if (categoryItem.id === currentCategory.id) {
            var newNoteObj = {};
            newNoteObj.id = shortid.generate();
            newNoteObj.text = noteObject.text;
            if (!isEmpty(noteObject.subnotes)) newNoteObj.subnotes = noteObject.subnotes;
            categoryItem.notes.push(newNoteObj);
          }
          // console.log("categoryItem: ", categoryItem);
          return categoryItem;
        });
      }
      // console.log("projectItem: ", projectItem);
      return projectItem;
    });

    todoData.uid = generateUniqueID();
    await this.setState({ todoData }, () => {
      // console.log("todoData: ", this.state.todoData);
      // localStorage.setItem("todoData", JSON.stringify(todoData));
      textAreaRef.current.value = "";

      // console.log("todoData: ", this.state.todoData);
      this.props.updateNotes(this.state.todoData);
      this.props.uploadNotes(this.state.todoData.list);
    });
    return "removed";
  };

  removeNote = (noteId) => {
    const { isAuthenticated } = this.props.auth;
    if (!isAuthenticated) return;

    // console.log("note id: ", noteId);

    var { todoData, currentCategory, currentProject } = this.state;

    todoData.list = todoData.list.map((projectItem) => {
      if (projectItem.id === currentProject.id) {
        projectItem.categories = projectItem.categories.map((categoryItem) => {
          if (categoryItem.id === currentCategory.id) {
            categoryItem.notes = categoryItem.notes.filter((noteItem) => {
              return noteItem.id !== noteId;
            });
          }
          return categoryItem;
        });
      }
      return projectItem;
    });

    todoData.uid = generateUniqueID();
    this.setState({ todoData }, () => {
      // localStorage.setItem("todoData", JSON.stringify(todoData));
      this.props.updateNotes(this.state.todoData);
      this.props.uploadNotes(this.state.todoData.list);
    });
  };

  editNote = (noteId, noteText, subnotes) => {
    const { isAuthenticated } = this.props.auth;
    if (!isAuthenticated) return;

    // console.log("edit note", noteId, noteText, subnotes);
    // return;

    const { currentCategory, currentProject } = this.state;
    var { todoData } = this.state;

    // console.log("noteId: ", noteId);
    // console.log("noteText: ", noteText);
    // console.log("subnotes: ", subnotes);

    todoData.list = todoData.list.map((projectItem) => {
      if (projectItem.id === currentProject.id) {
        projectItem.categories = projectItem.categories.map((categoryItem) => {
          if (categoryItem.id === currentCategory.id) {
            if (!isEmpty(categoryItem.notes)) {
              categoryItem.notes = categoryItem.notes.map((noteItem) => {
                if (noteItem.id === noteId) {
                  if (noteItem !== noteText) noteItem.text = noteText;

                  if (!isEmpty(noteItem.subnotes) && JSON.stringify(noteItem.subnotes) !== JSON.stringify(subnotes)) {
                    noteItem.subnotes = subnotes;
                  } else if (
                    isEmpty(noteItem.subnotes) &&
                    !isEmpty(subnotes) &&
                    JSON.stringify(noteItem.subnotes) !== JSON.stringify(subnotes)
                  ) {
                    noteItem.subnotes = subnotes;
                  }
                }
                return noteItem;
              });
            }
          }
          return categoryItem;
        });
      }
      return projectItem;
    });

    // console.log("changed todo: ", todoData);
    todoData.uid = generateUniqueID();
    this.setState({ todoData }, () => {
      // localStorage.setItem("todoData", JSON.stringify(todoData));
      this.props.updateNotes(this.state.todoData);
      this.props.uploadNotes(this.state.todoData.list);
    });
  };

  addCategoryShortcut = async (e, categoryText, inputCategoryRef) => {
    await this.addCategory(categoryText, inputCategoryRef);
  };

  addCategory = async (categoryText, inputCategoryRef) => {
    try {
      const { isAuthenticated } = this.props.auth;
      // console.log("add category:");
      if (!isAuthenticated) return;

      if (isEmpty(categoryText)) return;
      var { categoryList, currentProject } = this.state;

      var todoData = JSON.parse(JSON.stringify(this.state.todoData));

      var tempCategoryObj = {};
      tempCategoryObj.id = shortid.generate();
      tempCategoryObj.name = categoryText;

      categoryList.push(tempCategoryObj);

      var tempCategoryObj2 = Object.assign({}, JSON.parse(JSON.stringify(tempCategoryObj)));
      tempCategoryObj2.notes = [];

      todoData.list = todoData.list.map((dataItem) => {
        if (dataItem.id === currentProject.id) {
          dataItem.categories.push(tempCategoryObj2);
        }
        return dataItem;
      });

      todoData.uid = generateUniqueID();
      inputCategoryRef.current.value = "";
      // localStorage.setItem("todoData", JSON.stringify(todoData));
      var currentCategory = {
        name: categoryList[categoryList.length - 1].name,
        id: categoryList[categoryList.length - 1].id,
      };
      // console.log("setting new category: ", currentCategory);
      this.setState({ categoryList, todoData, currentCategory });
      this.props.updateNotes(this.state.todoData);
      this.props.uploadNotes(this.state.todoData.list);
    } catch (err) {
      console.log("add categ err", err);
    }
  };

  setCurrentCategory = (newCurrentCategoryName, currentProjectParam) => {
    // console.log("current category name: ", newCurrentCategoryName);

    const { todoData } = this.state;
    var currentProject = null;
    if (!isEmpty(currentProjectParam)) currentProject = currentProjectParam;
    else currentProject = this.state.currentProject;

    // Set initial selected category

    var currentCategory = todoData.list
      .filter((projectItem) => {
        return projectItem.id === currentProject.id;
      })[0]
      .categories.filter((categoryItem) => {
        return categoryItem.name === newCurrentCategoryName;
      })[0];

    // console.log("currentCategory setCurrent: ", currentCategory);

    this.setState({ currentCategory });

    // var currentCategoryObj = todoData.map(categoryItem index) =>{
    //   var tempObj = {};
    //   tempObj.name = categoryItem.category;
    //   tempObj.categoryIndex = index;
    //   return tempObj;
    // })

    // currentCategoryObj = currentCategoryObj.filter(item) =>{
    //   return item.name === newCurrentCategoryName
    // })[0];

    // this.setState({ currentCategory: currentCategoryObj });
  };

  removeCategory = (confirm) => {
    const { isAuthenticated } = this.props.auth;
    if (!isAuthenticated) return;

    var { todoData, currentCategory, currentProject, categoryList } = this.state;

    if (confirm) {
      todoData.list = todoData.list.filter((projectItem) => {
        if (projectItem.id !== currentProject.id) return true;
        else {
          projectItem.categories = projectItem.categories.filter((categoryItem) => {
            return categoryItem.id !== currentCategory.id;
          });
        }
        return true;
      });

      categoryList = categoryList.filter((categoryItem) => {
        return categoryItem.id !== currentCategory.id;
      });

      if (categoryList.length > 0) {
        currentCategory = categoryList[0];
      } else {
        currentCategory = null;
      }

      todoData.uid = generateUniqueID();
      return this.setState({ todoData, categoryList, currentCategory }, () => {
        // localStorage.setItem("todoData", JSON.stringify(todoData));
        this.props.updateNotes(this.state.todoData);
        this.props.uploadNotes(this.state.todoData.list);
      });
    } else if (
      !confirm &&
      todoData.list
        .filter((projectItem) => {
          return projectItem.id === currentProject.id;
        })[0]
        .categories.filter((categoryItem) => {
          return categoryItem.id === currentCategory.id;
        })[0].notes.length > 0
    ) {
      // console.log("there are items in the category, are u sure?");

      // 1 is code for "not empty" in this case
      return 1;
    } else {
      // category empty, delete without asking for confirmation
      todoData.list = todoData.list.filter((projectItem) => {
        if (projectItem.id !== currentProject.id) return true;
        else {
          projectItem.categories = projectItem.categories.filter((categoryItem) => {
            return categoryItem.id !== currentCategory.id;
          });
        }
        return true;
      });

      categoryList = categoryList.filter((categoryItem) => {
        return categoryItem.id !== currentCategory.id;
      });

      if (categoryList.length > 0) {
        currentCategory = categoryList[0];
      } else {
        currentCategory = null;
      }

      todoData.uid = generateUniqueID();
      return this.setState({ todoData, categoryList, currentCategory }, () => {
        // localStorage.setItem("todoData", JSON.stringify(todoData));
        this.props.updateNotes(this.state.todoData);
        this.props.uploadNotes(this.state.todoData.list);
      });
    }
  };

  changeItemCategory = (targetCategoryId, targetNoteObject) => {
    var { currentProject, todoData } = this.state;

    /*
      Steps:
      Save the target note in a temporary object.
      Find the category of the selected target note and filter the note out.
      Copy then remove the selected todoItem from its category.
      Push to array category by name provided in chosenCategory parameter.
    */

    // var targetNote = todoData.filter(projectItem =>{
    //   return projectItem.id === currentProject.id
    // })[0].categories.filter(categoryItem =>{
    //   return categoryItem.id === currentCategory.id
    // })[0].notes.filter(noteItem =>{
    //   return noteItem.id === targetNoteId
    // })[0];

    // console.log("targetNote: ", targetNote);

    // return;

    todoData.list = todoData.list.map((projectItem) => {
      if (projectItem.id === currentProject.id) {
        projectItem.categories = projectItem.categories.map((categoryItem) => {
          // Push the object into the target category's notes array
          if (categoryItem.id === targetCategoryId) {
            categoryItem.notes.push(targetNoteObject);
            return categoryItem;
          } else {
            // Search for the target note object in its old category and filter it out.
            categoryItem.notes = categoryItem.notes.filter((noteItem) => {
              return noteItem.id !== targetNoteObject.id;
            });
          }

          return categoryItem;
        });
      }

      return projectItem;
    });

    // return console.log("todo: ", todoData);

    todoData.uid = generateUniqueID();
    this.setState({ todoData }, (e) => {
      // localStorage.setItem("todoData", JSON.stringify(todoData));
      // console.log("data: ", this.state.todoData);

      this.props.updateNotes(this.state.todoData);
      this.props.uploadNotes(this.state.todoData.list);
    });
  };

  addProjectShortcut = async (e, projectName, categoryInputRef) => {
    return this.addProject(projectName, categoryInputRef);
  };

  addProject = async (projectName, categoryInputRef) => {
    const { isAuthenticated } = this.props.auth;
    // console.log("addProject isAuth", isAuthenticated);
    if (!isAuthenticated) return;

    categoryInputRef.current.value = "";
    if (isEmpty(projectName)) return;
    var { todoData, projectList } = this.state;

    var tempProjectObj = {};
    tempProjectObj.id = shortid.generate();
    tempProjectObj.name = projectName;

    try {
      var projectListNames = projectList.map((projectItem) => {
        return projectItem.name;
      });
    } catch (err) {
      // console.log("problem: ", err);
    }
    if (projectListNames.indexOf(projectName) !== -1) {
      // console.log("project exists");
      return "exists";
    }

    projectList.push(tempProjectObj);
    await this.setState({ projectList }, (state) => {
      var tempProjectObj2 = Object.assign({}, tempProjectObj);
      tempProjectObj2.categories = [];
      if (todoData === "cleared" || !todoData.list) todoData = { list: [] };
      todoData.list.push(tempProjectObj2);

      todoData.uid = generateUniqueID();
      this.setState({ todoData }, () => {
        // localStorage.setItem("todoData", JSON.stringify(todoData));
        // if (this.state.projectList.length === 1) {
        //   var currentProject = Object.assign({}, tempProjectObj);
        //   this.setState({ currentProject });
        // }

        // console.log("new project created");
        this.setState({ currentProject: Object.assign({}, tempProjectObj), currentCategory: null });
        this.props.updateNotes(this.state.todoData);
        this.props.uploadNotes(this.state.todoData.list);
      });
    });
    return "ready";
  };

  setCurrentProject = (newCurrentProjectName) => {
    try {
      const { todoData } = this.state;
      // Set initial selected project

      var currentProject = todoData.list
        .map((projectItem, index) => {
          var tempObj = {};
          tempObj.name = projectItem.name;
          tempObj.id = projectItem.id;
          return tempObj;
        })
        .filter((project) => {
          return project.name === newCurrentProjectName;
        })[0];

      // ////////

      var categories = todoData.list.filter((projectItem) => {
        return projectItem.id === currentProject.id;
      })[0].categories;

      if (categories.length > 0) {
        categories = categories.map((categoryItem) => {
          return {
            name: categoryItem.name,
            id: categoryItem.id,
          };
        });
      }
      this.setState(
        {
          currentProject,
          currentCategory: categories[0] || {},
          categoryList: categories,
        },
        () => {}
      );
    } catch (err) {
      console.log("set current project error", err);
    }
  };

  removeProject = (confirm) => {
    const { isAuthenticated } = this.props.auth;
    if (!isAuthenticated) return;

    var { todoData, currentProject, projectList, categoryList } = this.state;

    var currentCategory = null;

    if (confirm) {
      try {
        // console.log("confirm");
        todoData.list = todoData.list.filter((projectItem) => {
          return projectItem.id !== currentProject.id;
        });
        projectList = projectList.filter((projectItem) => {
          return projectItem.id !== currentProject.id;
        });

        if (projectList.length > 0) {
          currentProject = projectList[0];

          currentCategory = todoData.list
            .filter((projectItem) => {
              return projectItem.id === currentProject.id;
            })[0]
            .categories.map((categoryItem) => {
              return {
                name: categoryItem.name,
                id: categoryItem.id,
              };
            })[0];

          categoryList = todoData.list
            .filter((projectItem) => {
              return projectItem.id === currentProject.id;
            })[0]
            .categories.map((categoryItem) => {
              return {
                name: categoryItem.name,
                id: categoryItem.id,
              };
            });
          // console.log("remove project current category: ", currentCategory);
        } else {
          currentProject = null;
          categoryList = [];
        }
      } catch (err) {
        // console.log("remove project err: ", err);
      }

      if (currentProject === null) {
        return this.setState(
          { todoData: "cleared", projectList, categoryList, currentProject, currentCategory },
          () => {
            this.props.updateNotes(this.state.todoData);
            this.props.uploadNotes([]);
          },
          () => {
            // this.setState({ todoData: [] });
          }
        );
      }

      todoData.uid = generateUniqueID();
      return this.setState({ todoData, projectList, categoryList, currentProject, currentCategory }, () => {
        // console.log("remove project todoData: ", this.state.todoData);
        this.props.updateNotes(this.state.todoData);
        this.props.uploadNotes(this.state.todoData.list);
      });
    }
  };

  editProjectName = (editedProjectName) => {
    const { isAuthenticated } = this.props.auth;
    if (!isAuthenticated) return;

    var { todoData, currentProject } = this.state;

    todoData.list = todoData.list.map((projectItem) => {
      if (projectItem.id === currentProject.id) {
        projectItem.name = editedProjectName;
      }

      return projectItem;
    });

    currentProject.name = editedProjectName;

    todoData.uid = generateUniqueID();
    this.setState({ todoData, currentProject }, () => {
      this.props.updateNotes(this.state.todoData);
      this.props.uploadNotes(this.state.todoData.list);
    });
    // localStorage.setItem("todoData", JSON.stringify(todoData));
  };

  exportData = () => {
    const { isAuthenticated } = this.props.auth;
    if (!isAuthenticated) return;

    var textFile = null,
      makeTextFile = (text) => {
        var data = new Blob([text], { type: "text/plain" });
        // var data = new Blob([JSON.stringify(text, null, 2)], { type: 'application/json' });

        // If we are replacing a previously generated file we need to
        // manually revoke the object URL to avoid memory leaks.
        if (textFile !== null) {
          window.URL.revokeObjectURL(textFile);
        }

        textFile = window.URL.createObjectURL(data);

        // returns a URL you can use as a href
        return textFile;
      };

    // var textbox = document.getElementById('textbox');
    const { todoData } = this.state;
    var textbox = JSON.stringify(todoData.list);

    var link = document.createElement("a");
    link.setAttribute("download", "todoData.json");
    // link.href = makeTextFile(textbox.value);
    link.href = makeTextFile(textbox);
    document.body.appendChild(link);

    // wait for the link to be added to the document
    window.requestAnimationFrame(() => {
      var event = new MouseEvent("click");
      link.dispatchEvent(event);
      document.body.removeChild(link);
    });
  };

  importData = (input) => {
    const { isAuthenticated } = this.props.auth;
    if (!isAuthenticated) return;

    try {
      let file = input.target.files[0];

      let reader = new FileReader();

      reader.readAsText(file);

      reader.onload = () => {
        // console.log(JSON.parse(reader.result));
        this.loadData(reader.result);
        // localStorage.setItem("todoData", reader.result);
      };

      reader.onerror = () => {
        // console.log(reader.error);
      };
    } catch (err) {
      // console.log("import err: ", err);
    }
  };

  loadData = (data) => {
    // console.log("data: ", data);

    this.setState({ todoData: {}, currentProject: null, currentCategory: null, categoryList: [], projectList: [] }, () => {
      if (typeof data === "string") {
        data = JSON.parse(data);
        data.uid = generateUniqueID();
      }

      //   console.log("data", data);

      this.setState({ todoData: JSON.parse(JSON.stringify(data)) }, () => {
        const { todoData } = this.state;
        // console.log("data", todoData);

        this.props.updateNotes(todoData);
        try {
          const projectList = todoData.list.map((dataItem) => {
            return {
              name: dataItem.name,
              id: dataItem.id,
            };
          });

          const currentProject = projectList[0];

          const categoryList = todoData.list
            .filter((dataItem) => {
              return dataItem.id === currentProject.id;
            })[0]
            .categories.map((categoryItem) => {
              return {
                name: categoryItem.name,
                id: categoryItem.id,
              };
            });

          const currentCategory = categoryList[0];

          this.setState({
            projectList,
            currentProject,
            categoryList,
            currentCategory,
            // , loadedNotesFromRedux: false
          });
        } catch (err) {
          //   console.log("err: ", err, todoData);
        }
      });
    });
  };

  openNavbarMenu = async (state) => {
    await this.setState({ navbarOpen: state });
  };

  render() {
    const { todoData, currentCategory, categoryList, currentProject, projectList, navbarOpen } = this.state;

    return (
      <div className="parentDivWrapper">
        <div className="parentDiv">
          <Navbar
            todoData={todoData}
            addCategory={this.addCategory}
            addCategoryShortcut={this.addCategoryShortcut}
            setCurrentCategory={this.setCurrentCategory}
            removeCategory={this.removeCategory}
            currentCategory={currentCategory}
            categoryList={categoryList}
            addProject={this.addProject}
            addProjectShortcut={this.addProjectShortcut}
            setCurrentProject={this.setCurrentProject}
            removeProject={this.removeProject}
            currentProject={currentProject}
            projectList={projectList}
            exportData={this.exportData}
            importData={this.importData}
            navbarOpen={navbarOpen}
          />
          <TodoContainer
            todoData={todoData}
            currentProject={currentProject}
            currentCategory={currentCategory}
            categoryList={categoryList}
            projectList={projectList}
            changeItemCategory={this.changeItemCategory}
            addNote={this.addNote}
            editNote={this.editNote}
            addNoteShortcut={this.addNoteShortcut}
            removeNote={this.removeNote}
            editProjectName={this.editProjectName}
            openNavbarMenu={this.openNavbarMenu}
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
  };
}

export default connect(mapStateToProps, { updateNotes, uploadNotes, setLastNotes, setServerResponseMsg, setNotesOrigin, clearState })(
  Controller
);
