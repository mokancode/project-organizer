import React, { Component } from "react";
import "./EditNote.css";
import isEmpty from "../../validation/is-empty";
import classnames from "classnames";
import shortid from "shortid";
import EditSubNoteItem from "./EditSubNoteItem";
import { connect } from "react-redux";
import { setIgnoreNavbarShortcuts } from "../../actions/styleActions";

export class EditNote extends Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.editNoteWindowFunc = this.props.editNoteWindowFunc;
    this.editNote = this.props.editNote;
    this.addNoteShortcut = this.props.addNoteShortcut;

    // refs
    this.textAreaRef = React.createRef();
    this.subNoteInputRef = React.createRef();
    this.editableSubNoteListRef = React.createRef();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { editableNoteObject } = nextProps;

    // console.log("editnote received props");
    if (!isEmpty(editableNoteObject) && JSON.stringify(editableNoteObject) !== JSON.stringify(prevState.editableNoteObject)) {
      // console.log("editnote updated props");
      return {
        editableNoteObject: editableNoteObject,
        noteText: editableNoteObject.text,
        // subNoteList: Object.assign([], editableNoteObject.subnotes),
        editableSubNoteList: Object.assign([], editableNoteObject.subnotes),
        noteId: editableNoteObject.noteId,
      };
    }

    return null;
  }

  updateSubNote(updatedSubNote) {
    var { editableSubNoteList } = this.state;

    editableSubNoteList = editableSubNoteList.map((subNoteItem) => {
      if (subNoteItem.id === updatedSubNote.id) {
        subNoteItem.text = updatedSubNote.text;
      }
      return subNoteItem;
    });

    this.setState({ editableSubNoteList });
  }

  removeSubNote(subNoteId) {
    // console.log("subnote id: ", subNoteId);
    const { editableSubNoteList } = this.state;
    this.setState({
      editableSubNoteList: editableSubNoteList.filter((subNoteItem) => {
        return subNoteItem.id !== subNoteId;
      }),
    });
  }

  closeEditNote = (e) => {
    if (e.key === "Escape") this.setState({ cancelAnim: true });
  };

  componentDidMount() {
    this.props.setIgnoreNavbarShortcuts(true);
    window.addEventListener("keydown", (e) => this.closeEditNote(e));
  }
  
  componentWillUnmount() {
    this.props.setIgnoreNavbarShortcuts(false);
    window.removeEventListener("keydown", (e) => this.closeEditNote(e));
  }

  render() {
    const { noteId, noteText, subNoteText, cancelAnim, editableSubNoteList } = this.state;

    return (
      <div
        onAnimationEnd={async () => {
          if (cancelAnim) this.editNoteWindowFunc(false);
          // no need to set cancelAnim to false, because the component will now unmount.
        }}
        className={classnames("editNoteWrapperDiv", {
          editNoteWrapperDivClose: cancelAnim,
        })}
      >
        <div
          className={classnames("editNoteDiv", {
            editNoteDivClose: cancelAnim,
          })}
        >
          <div className="addNoteDiv">
            <textarea
              autoComplete={"off"}
              defaultValue={noteText}
              ref={this.textAreaRef}
              onKeyDown={async (e) => {
                if (e.ctrlKey && e.keyCode === 13) {
                  //   await this.addNoteShortcut(e, { text: noteText, subnotes: editableSubNoteList }, this.textAreaRef);
                  await this.editNote(noteId, noteText, editableSubNoteList);

                  this.setState({ noteText: "", cancelAnim: true });
                }
              }}
              onChange={(e) => {
                this.setState({ [e.target.name]: e.target.value });
              }}
              name="noteText"
              type="text"
              placeholder="Type new note here"
            ></textarea>
            <div className="addSubNoteWrapperDiv">
              {!isEmpty(editableSubNoteList) ? (
                <ol ref={this.editableSubNoteListRef}>
                  {editableSubNoteList.map((subNote, index) => {
                    return (
                      <li key={subNote.id}>
                        <EditSubNoteItem
                          subNote={subNote}
                          editableSubNoteList={editableSubNoteList}
                          updateSubNote={this.updateSubNote}
                          removeSubNote={this.removeSubNote}
                          originalSubNoteList={this.props.originalSubNoteList}
                        />
                      </li>
                    );
                  })}
                </ol>
              ) : null}
              <div className="addSubNoteDiv">
                <input
                  autoComplete={"off"}
                  onKeyDown={async (e) => {
                    if (e.ctrlKey && e.keyCode === 13) {
                      if (isEmpty(subNoteText)) return;
                      editableSubNoteList.push({ text: subNoteText, id: shortid.generate() });
                      await this.setState({ editableSubNoteList }, () => {
                        this.setState({ subNoteText: "" });
                        this.subNoteInputRef.current.value = "";
                      });
                      this.subNoteInputRef.current.focus();

                      // await this.addNoteShortcut(e, { text: noteText, subnotes: subNoteList }, this.textAreaRef);
                      // this.setState({ noteText: "", subNoteList: [] });

                      var element =
                        this.editableSubNoteListRef.current.childNodes[this.editableSubNoteListRef.current.childNodes.length - 1];
                      // console.log("elt: ", element);
                      this.editableSubNoteListRef.current.scroll({
                        behavior: "smooth",
                        left: 0,
                        top: element.offsetTop,
                      });
                    }
                  }}
                  ref={this.subNoteInputRef}
                  placeholder={"New subnote here"}
                  type="text"
                  name="subNoteText"
                  onChange={(e) => {
                    this.setState({ [e.target.name]: e.target.value });
                  }}
                ></input>
                <button
                  // onClick={async (e) =>{
                  //     await this.addNote(noteText, this.textAreaRef);
                  //     this.setState({ noteText: "" });
                  // }}
                  onClick={async (e) => {
                    if (isEmpty(subNoteText)) return;
                    editableSubNoteList.push({ text: subNoteText, id: shortid.generate() });
                    await this.setState({ editableSubNoteList }, () => {
                      this.setState({ subNoteText: "" });
                      this.subNoteInputRef.current.value = "";
                      this.subNoteInputRef.current.focus();

                      var element =
                        this.editableSubNoteListRef.current.childNodes[this.editableSubNoteListRef.current.childNodes.length - 1];
                      this.editableSubNoteListRef.current.scroll({
                        behavior: "smooth",
                        left: 0,
                        top: element.offsetTop,
                      });
                    });
                  }}
                  className="addSubNoteBtn addNoteBtn"
                >
                  +
                </button>
              </div>
            </div>
            <div className="editNoteBtnsDiv">
              <button
                onClick={async (e) => {
                  if (
                    isEmpty(noteText) ||
                    (!isEmpty(noteText) &&
                      String(noteText).localeCompare(this.props.editableNoteObject.text) === 0 &&
                      JSON.stringify(editableSubNoteList) === JSON.stringify(this.props.originalSubNoteList))
                  )
                    return;

                  await this.editNote(noteId, noteText, editableSubNoteList);
                  this.setState({ cancelAnim: true });
                }}
                className={classnames("confirmEditNoteBtn", {
                  confirmEditNoteBtnUnclickable:
                    // note is empty
                    isEmpty(noteText) ||
                    // // OR note hasn't changed
                    (!isEmpty(noteText) &&
                      String(noteText).localeCompare(this.props.editableNoteObject.text) === 0 &&
                      // // AND list hasn't changed
                      JSON.stringify(editableSubNoteList) === JSON.stringify(this.props.originalSubNoteList)),
                })}
              >
                Confirm
              </button>
              <button
                onClick={async (e) => {
                  this.setState({ cancelAnim: true });
                }}
                className="cancelEditNoteBtn confirmEditNoteBtn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    styles: state.styles,
  };
}

export default connect(mapStateToProps, { setIgnoreNavbarShortcuts })(EditNote);
