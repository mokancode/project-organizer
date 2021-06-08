import React, { Component } from "react";
import isEmpty from "../../validation/is-empty";
import CancelIcon from "../SVGs/CancelIcon/CancelIcon";
import PencilIcon from "../SVGs/PencilIcon/PencilIcon";
import TickIcon from "../SVGs/TickIcon/TickIcon";
import TrashcanIcon from "../SVGs/TrashcanIcon/TrashcanIcon";

export class EditSubNoteItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editNoteEnabled: false,
      editedSubNoteText: "",
    };

    this.updateSubNote = this.props.updateSubNote;
    this.removeSubNote = this.props.removeSubNote;

    // refs
    this.editSubNoteRef = React.createRef();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!isEmpty(nextProps.subNote) && isEmpty(prevState.subNote)) {
      return {
        subNote: Object.assign({}, nextProps.subNote),
      };
    }
    return null;
  }

  componentDidUpdate() {
    try {
      const { subNote, editNoteEnabled, textAreaColsUpdated } = this.state;
      if (subNote.text.length > 20 && editNoteEnabled && !textAreaColsUpdated) {
        this.setState({ textAreaColsUpdated: true });
        this.editSubNoteRef.current.cols = subNote.text.length;
      }

      if (
        !isEmpty(this.props.subNote) &&
        !isEmpty(this.state.subNote) &&
        JSON.stringify(this.props.subNote) !== JSON.stringify(this.state.subNote)
      ) {
        this.setState({ subNote: Object.assign({}, this.props.subNote) });
      }
    } catch (err) {}
  }

  render() {
    const { subNote, editedSubNoteText, editNoteEnabled } = this.state;

    return (
      <div className="subnoteItemWrapper">
        {editNoteEnabled === false ? (
          <div className="subnoteItemDiv">
            <p>{subNote.text}</p>

            <div className="subnoteButtons">
              <div
                className="editSubNoteBtnDiv"
                onClick={(e) => {
                  this.setState({ editNoteEnabled: true, textAreaColsUpdated: false }, (e) => {
                    this.editSubNoteRef.current.focus();
                    var temp_value = this.editSubNoteRef.current.value;
                    this.editSubNoteRef.current.value = "";
                    this.editSubNoteRef.current.value = temp_value;
                  });
                  // this.editNoteWindowFunc(true, { text, subnotes, noteId })
                }}
              >
                <PencilIcon />
              </div>
              <div
                className="removeSubnoteBtn"
                onClick={(e) => {
                  this.removeSubNote(subNote.id);
                }}
              >
                <TrashcanIcon />
              </div>
            </div>
          </div>
        ) : (
          <div className="subnoteEditDiv">
            <textarea
              ref={this.editSubNoteRef}
              defaultValue={subNote.text}
              type="text"
              onChange={(e) => {
                this.setState({ editedSubNoteText: e.target.value.trim() }, () => {
                  const { editedSubNoteText } = this.state;
                  if (String(subNote.text).localeCompare(editedSubNoteText) === 0) {
                    this.setState({ editedSubNoteText: "" });
                  }

                  if (editedSubNoteText.length > 20) {
                    this.editSubNoteRef.current.cols = editedSubNoteText.length;
                  } else this.editSubNoteRef.current.cols = 20;
                });
              }}
            ></textarea>

            <div className="subnoteButtons">
              <div
                className="editSubNoteBtnDiv confirmEditSubnote"
                onClick={(e) => {
                  if (isEmpty(editedSubNoteText)) return;
                  var { subNote } = this.state;
                  subNote.text = editedSubNoteText;
                  this.setState({ subNote, editNoteEnabled: false, editedSubNoteText: "", textAreaColsUpdated: false }, () => {
                    var updatedSubNote = {};
                    updatedSubNote.id = subNote.id;
                    updatedSubNote.text = subNote.text;
                    this.updateSubNote(updatedSubNote);
                  });
                }}
              >
                <TickIcon isClickable={!isEmpty(editedSubNoteText) && String(subNote.text).localeCompare(editedSubNoteText) !== 0} />
              </div>
              <div
                className="cancelEditNote"
                onClick={(e) => {
                  this.setState({
                    editNoteEnabled: false,
                  });
                }}
              >
                <CancelIcon />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default EditSubNoteItem;
