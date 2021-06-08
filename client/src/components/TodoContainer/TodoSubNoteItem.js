import React, { Component } from "react";
import SaveIcon from "../SVGs/SaveIcon/SaveIcon";
import isEmpty from "../../validation/is-empty";

export class TodoSubNoteItem extends Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.editSubNote = this.props.editSubNote;
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!isEmpty(nextProps.subNote) && isEmpty(prevState.subNote)) {
      return {
        subNote: nextProps.subNote,
        subNoteText: nextProps.subNote.text,
      };
    }
    return null;
  }

  render() {
    const { editableSubNote, subNoteText } = this.state;
    const { subNote } = this.props;

    return (
      <div className="todoSubNoteDiv">
        {!editableSubNote ? (
          <p
            onClick={(e) => {
              this.setState((prevState) => {
                return {
                  editableSubNote: !prevState.editableSubNote,
                };
              });
            }}
          >
            {subNote.text}
          </p>
        ) : (
          <div className="todoSubNoteInputDiv">
            <input
              type="text"
              defaultValue={subNote.text}
              onChange={(e) => {
                this.setState({ subNoteText: e.target.value });
              }}
            ></input>
            <div
              className="saveIconDiv"
              onClick={async (e) => {
                await this.editSubNote({ text: subNoteText, id: subNote.id });
                this.setState({ editableSubNote: false });
              }}
            >
              <SaveIcon />
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default TodoSubNoteItem;
